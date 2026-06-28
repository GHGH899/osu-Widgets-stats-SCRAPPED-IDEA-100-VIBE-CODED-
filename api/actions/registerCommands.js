import { DiscordRequest } from "../../utils";

/**
 * Action to register application commands with Discord
 */
export async function run({ api, logger }) {
  const appId = process.env.APP_ID;
  if (!appId) {
    throw new Error("Missing APP_ID environment variable in settings.");
  }

  // Target global application commands endpoint
  const endpoint = `applications/${appId}/commands`;

  const commands = [
    {
      name: 'help',
      description: 'Get help using the osu! Stats Widget bot',
      type: 1, // CHAT_INPUT / Slash Command
    },
    {
      name: 'link',
      description: 'Link your osu! account to your Discord profile widget',
      type: 1,
    },
    {
      name: 'refresh',
      description: 'Force refresh your osu! profile widget stats',
      type: 1,
    }
  ];

  try {
    logger.info("Sending command schema mapping payload to Discord...");
    
    const response = await DiscordRequest(endpoint, {
      method: "PUT",
      body: commands,
    });

    if (response.ok) {
      const data = await response.json();
      logger.info({ data }, "Successfully synced application commands with Discord.");
    } else {
      const errorText = await response.text();
      throw new Error(`Discord registration failed: ${errorText}`);
    }
  } catch (err) {
    logger.error({ err }, "Failed during application command sync sequence.");
    throw err;
  }
}