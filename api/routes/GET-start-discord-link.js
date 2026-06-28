import { RouteHandler } from "gadget-server";

/** @type { RouteHandler } */
const route = async ({ request, reply, logger, applicationSession }) => {
  const userId = applicationSession?.userId ?? applicationSession?.user?.id;

  if (!userId) {
    await reply.code(401).send({ error: "Unauthorized. Please sign in first." });
    return;
  }

  const discordClientId = process.env.APP_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URL;
  const scopes = "identify";
  const state = `gadget_user:${userId}`;

  const params = new URLSearchParams({
    client_id: discordClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    state: state,
  });

  const authorizeUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;

  logger.info({ userId, stateIncluded: true }, "Redirecting user to Discord OAuth authorize URL");

  await reply.redirect(authorizeUrl);
};

export default route;