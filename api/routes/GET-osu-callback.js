import { RouteHandler } from "gadget-server";

/**
 * @type { RouteHandler }
 */
const route = async ({ request, reply, logger, api, applicationSession }) => {
  const { code, state } = request.query;

  // Resolve the current user id, preferring the OAuth state parameter.
  // Primary format: "gadget_user:<userId>"
  // Fallback: a plain numeric string treated as the user id directly.
  let currentUserId = null;

  if (state) {
    const stateStr = String(state).trim();
    const prefix = "gadget_user:";

    if (stateStr.startsWith(prefix)) {
      const extracted = stateStr.slice(prefix.length);
      if (extracted.length > 0) {
        currentUserId = extracted;
      }
    } else if (/^\d+$/.test(stateStr)) {
      // Fallback: plain numeric user id
      currentUserId = stateStr;
    }

    if (currentUserId) {
      logger.info({ currentUserId }, "Resolved user id from OAuth state parameter");
    } else {
      logger.warn("OAuth state parameter present but could not extract a valid user id");
      return reply
        .status(400)
        .send(
          "Invalid linking state. The state parameter was malformed. " +
            "Please go back to your signed-in page and restart the account linking flow."
        );
    }
  }

  // Defensive fallback: try to resolve from the session if state did not yield a user id
  if (!currentUserId && applicationSession) {
    if (typeof applicationSession.get === "function") {
      currentUserId = applicationSession.get("user");
    }
    if (!currentUserId) {
      currentUserId = applicationSession.userId ?? applicationSession.user ?? null;
    }
    if (currentUserId && typeof currentUserId === "object" && currentUserId.id) {
      currentUserId = currentUserId.id;
    }
    if (currentUserId) {
      logger.info({ currentUserId }, "Resolved user id from application session (fallback)");
    }
  }

  if (!currentUserId) {
    logger.warn(
      {
        hasState: !!state,
        hasSession: !!applicationSession,
      },
      "osu! callback hit without a resolvable user id from state or session"
    );
    return reply
      .status(401)
      .send(
        "Unable to identify your account. The linking state may have expired or been lost. " +
          "Please go back to your signed-in page and restart the account linking flow."
      );
  }

  if (!code) {
    logger.warn({ query: request.query, userId: currentUserId }, "Missing osu! authorization code in callback");
    return reply.status(400).send("Synchronization failed: Missing osu! authorization code.");
  }

  const { OSU_CLIENT_ID, OSU_CLIENT_SECRET, OSU_REDIRECT_URL, APP_ID, DISCORD_TOKEN } = process.env;

  if (!APP_ID || !DISCORD_TOKEN) {
    logger.error({ hasAppId: !!APP_ID, hasDiscordToken: !!DISCORD_TOKEN }, "Missing required Discord environment variables");
    return reply.status(500).send("Server configuration error: Missing Discord credentials.");
  }

  if (!OSU_CLIENT_ID || !OSU_CLIENT_SECRET || !OSU_REDIRECT_URL) {
    logger.error("Missing required osu! environment variables");
    return reply.status(500).send("Server configuration error: Missing osu! credentials.");
  }

  try {
    // 1. Look up the osuConnection record for the resolved user
    const existingConnection = await api.osuConnection.maybeFindFirst({
      filter: { userId: { equals: currentUserId } },
      select: { id: true, discordId: true, osuId: true, osuUsername: true },
    });

    if (!existingConnection) {
      logger.warn({ userId: currentUserId }, "No osuConnection record found for user");
      return reply.status(400).send(
        "No connection record found for your account. Please complete the Discord linking step first."
      );
    }

    if (!existingConnection.discordId) {
      logger.warn({ userId: currentUserId, connectionId: existingConnection.id }, "osuConnection exists but discordId is not set");
      return reply.status(400).send(
        "Your Discord account is not linked yet. Please complete the Discord linking step before linking osu!."
      );
    }

    const discordUserId = existingConnection.discordId;

    // 2. Exchange osu! code for token
    const tokenResponse = await fetch("https://osu.ppy.sh/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: OSU_CLIENT_ID,
        client_secret: OSU_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: OSU_REDIRECT_URL,
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      logger.error({ status: tokenResponse.status, body: errorBody }, "osu! token exchange failed");
      return reply.status(502).send("Failed to exchange osu! authorization code for token.");
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      logger.error({ tokenData }, "osu! token response missing access_token");
      return reply.status(502).send("osu! token response did not include an access token.");
    }

    // 3. Fetch osu! user profile
    const userResponse = await fetch("https://osu.ppy.sh/api/v2/me/osu", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      const errorBody = await userResponse.text();
      logger.error({ status: userResponse.status, body: errorBody }, "osu! profile fetch failed");
      return reply.status(502).send("Failed to fetch osu! user profile.");
    }

    const userData = await userResponse.json();

    if (!userData.username || !userData.id) {
      logger.error({ userData }, "osu! profile response missing required fields");
      return reply.status(502).send("osu! profile response was incomplete.");
    }

    // 4. Update the osuConnection record with latest osu! profile info
    await api.osuConnection.update(existingConnection.id, {
      osuUsername: userData.username,
      osuId: String(userData.id),
    });

    // 5. Calculate Playtime
    const totalSeconds = userData.statistics?.play_time || 0;
    const totalHours = Math.floor(totalSeconds / 3600);
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
    const totalPlaytimeStr = `${days}d ${remainingHours}h ${remainingMinutes}m`;

    // 6. Construct Discord Widget Payload
    const widgetPayload = {
      layout: {
        components: [
          { type: 2, id: "username", value: userData.username },
          { type: 2, id: "country", value: userData.country?.name || "Unknown" },
          { type: 2, id: "global_rank", value: `#${userData.statistics?.global_rank || "0"}` },
          { type: 2, id: "country_rank", value: `#${userData.statistics?.country_rank || "0"}` },
          { type: 2, id: "performance_point", value: `${Math.round(userData.statistics?.pp || 0)}pp` },
          { type: 2, id: "accuracy", value: `${userData.statistics?.hit_accuracy?.toFixed(2) || "0"}%` },
          { type: 2, id: "medals_count", value: `${userData.user_achievements?.length || "0"}` },
          { type: 2, id: "total_playtime", value: totalPlaytimeStr },
          { type: 2, id: "mini_profile_title", value: `Global Rank: #${userData.statistics?.global_rank || "0"}` },
        ],
      },
    };

    // 7. Push update to Discord widget
    const updateRes = await fetch(
      `https://discord.com/api/v10/users/${discordUserId}/profile/application-widgets/${APP_ID}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${DISCORD_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(widgetPayload),
      }
    );

    if (!updateRes.ok) {
      const errorBody = await updateRes.text();
      logger.error(
        { status: updateRes.status, body: errorBody, discordUserId, appId: APP_ID, userId: currentUserId },
        "Discord widget update API request failed"
      );
      return reply.status(502).send("Failed to push osu! stats update to Discord widget.");
    }

    logger.info({ discordUserId, osuUsername: userData.username, userId: currentUserId }, "Discord widget updated successfully");
    return reply.send("Sync successful! Your osu! stats widget has been updated on Discord.");
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack, userId: currentUserId }, "Unexpected error in osu callback sync pipeline");
    return reply.status(500).send("Internal server error during synchronization.");
  }
};

export default route;