import { RemoveCommandsGlobalActionContext } from "gadget-server";
import { DiscordRequest } from "../../utils"
import { TEST_COMMAND, CHALLENGE_COMMAND } from "./registerCommands";

/**
 * @param { RemoveCommandsGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  //  /applications/{application.id}/commands
  const appId = process.env.APP_ID;

  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    const resp = await DiscordRequest(endpoint, { method: 'GET' });
    const commands = await resp.json();

    const commandIds = commands.filter(command => command.name === TEST_COMMAND.name || command.name === CHALLENGE_COMMAND.name).map(command => command.id);
    for (const commandId of commandIds) {
      await DiscordRequest(`${endpoint}/${commandId}`, { method: "DELETE" });
    }
  } catch (err) {
    logger.error({ err }, "Error deleting commands");
  }
};

export const options = { triggers: { api: true } }