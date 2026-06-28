import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
} from 'discord-interactions';
import { getRandomEmoji } from '../../utils';

export default async function route({ request, reply, api, logger }) {
  const { type, data, member } = request.body;

  if (type === InteractionType.PING) {
    return reply.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    const userId = member.user.id;

    // "/help" Command
    if (name === 'help') {
      return reply.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `👋 **osu! Stats Widget Bot Help** ${getRandomEmoji()}\n\n` +
                   `• \`/link\` : Connect your osu! account to your Discord profile dashboard.\n` +
                   `• \`/refresh\` : Force an instant update of your profile widget stats.`,
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }

    // "/link" Command
    if (name === 'link') {
      // Safe Fallbacks using your exact verified keys from Settings
      const appId = process.env.APP_ID || "152060423342117035";
      const redirectUrl = process.env.DISCORD_REDIRECT_URL || "https://osu-stats--development.gadget.app/discord-callback";

      logger.info({ appId, redirectUrl }, "Generating Discord OAuth application linkage URL");

      const discordAuthUrl = `https://discord.com/oauth2/authorize?` + 
        `client_id=${appId}` +
        `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
        `&response_type=code` +
        `&scope=identify%20role_connections.write`;

      return reply.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `🔗 **Link your accounts**\nClick below to authorize your account and load your custom profile widget!`,
          flags: InteractionResponseFlags.EPHEMERAL,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  style: 5, 
                  label: 'Connect Account',
                  url: discordAuthUrl,
                },
              ],
            },
          ],
        },
      });
    }

    // "/refresh" Command
    if (name === 'refresh') {
      return reply.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `🔄 **Refreshing stats for** <@${userId}>...\nChecking the osu! API for updates!`,
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }
  }
}