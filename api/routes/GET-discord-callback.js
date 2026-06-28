export default async function route({ request, reply, api, logger }) {
  const { code, state, error, error_description } = request.query;

  // 1. Handle any explicit cancellation errors from Discord
  if (error) {
    logger.error({ error, error_description }, "Discord OAuth returned an inline error");
    return reply.status(400).send(`Discord Auth Error: ${error_description || error}`);
  }

  if (!code) {
    return reply.status(400).send("Missing temporary authorization code from Discord.");
  }

  // 2. Validate the state parameter which carries the app user id
  if (!state || typeof state !== "string" || state.trim().length === 0) {
    logger.error({ statePresent: !!state }, "Discord callback received with missing or empty state parameter");
    return reply.status(400).send("Missing or invalid state parameter. Please restart the linking flow.");
  }

  const trimmedState = state.trim();

  // Parse state: accept "gadget_user:<userId>" format or plain numeric string as fallback
  let userId;
  const prefixMatch = trimmedState.match(/^gadget_user:(\d+)$/);
  if (prefixMatch) {
    userId = prefixMatch[1];
  } else if (/^\d+$/.test(trimmedState)) {
    userId = trimmedState;
  } else {
    logger.error({ stateLength: trimmedState.length }, "Discord callback state parameter does not match expected format");
    return reply.status(400).send("Invalid state parameter format. Expected 'gadget_user:<userId>' or a numeric user ID. Please restart the linking flow.");
  }

  // 3. Load environment variables (no hard-coded fallbacks)
  const appId = process.env.APP_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URL;

  if (!appId || !clientSecret || !redirectUri) {
    logger.error("Missing required Discord environment variables (APP_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URL)");
    return reply.status(500).send("Server configuration error.");
  }

  try {
    logger.info({ userId }, "Exchanging Discord authorization code for access token...");

    // 4. Exchange the authorization code for a Discord access token
    const tokenResponse = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      logger.error(
        { status: tokenResponse.status, body: tokenData },
        "Discord API rejected the token exchange request"
      );
      return reply.status(502).send("Failed to exchange Discord authorization code for a token.");
    }

    const discordAccessToken = tokenData.access_token;
    if (!discordAccessToken) {
      logger.error({ tokenData }, "Discord token response did not include an access_token");
      return reply.status(502).send("Discord token response was invalid.");
    }

    // 5. Fetch the Discord user identity using the access token
    const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bearer ${discordAccessToken}`,
      },
    });

    const discordUser = await userResponse.json();

    if (!userResponse.ok) {
      logger.error(
        { status: userResponse.status, body: discordUser },
        "Failed to fetch Discord user identity"
      );
      return reply.status(502).send("Failed to retrieve Discord user profile.");
    }

    if (!discordUser.id || !discordUser.username) {
      logger.error({ discordUser }, "Discord user profile missing id or username");
      return reply.status(502).send("Discord user profile is incomplete.");
    }

    logger.info(
      { discordUserId: discordUser.id, discordUsername: discordUser.username },
      "Successfully fetched Discord user identity"
    );

    // 6. Persist Discord identity into the osuConnection model for the current user
    const existingConnection = await api.osuConnection.maybeFindFirst({
      filter: { userId: { equals: userId } },
      select: { id: true },
    });

    if (existingConnection) {
      await api.osuConnection.update(existingConnection.id, {
        discordId: discordUser.id,
      });
      logger.info({ connectionId: existingConnection.id }, "Updated existing osuConnection with Discord identity");
    } else {
      await api.osuConnection.create({
        discordId: discordUser.id,
        user: { _link: userId },
      });
      logger.info("Created new osuConnection with Discord identity");
    }

    // 7. Build the osu! authorization redirect URL
    const osuClientId = process.env.OSU_CLIENT_ID;
    const osuRedirectUri = process.env.OSU_REDIRECT_URL;

    if (!osuClientId || !osuRedirectUri) {
      logger.error("Missing required osu! environment variables (OSU_CLIENT_ID, OSU_REDIRECT_URL)");
      return reply.status(500).send("Server configuration error.");
    }

    // Use the prefixed format so the osu callback can parse it consistently
    const osuState = `gadget_user:${userId}`;

    const osuAuthUrl =
      `https://osu.ppy.sh/oauth/authorize?` +
      `client_id=${osuClientId}` +
      `&redirect_uri=${encodeURIComponent(osuRedirectUri)}` +
      `&response_type=code` +
      `&scope=identify` +
      `&state=${encodeURIComponent(osuState)}`;

    // 8. Redirect the user to osu! authorization
    return reply.redirect(osuAuthUrl);
  } catch (err) {
    logger.error({ err }, "Unexpected error in Discord callback handler");
    return reply.status(500).send("Internal server error during Discord account linking.");
  }
}