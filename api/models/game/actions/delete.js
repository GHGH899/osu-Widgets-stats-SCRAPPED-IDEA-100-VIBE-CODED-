import { deleteRecord, ActionOptions, DeleteGamesActionContext } from "gadget-server";

/**
 * @param { DeleteGamesActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/**
 * @param { DeleteGamesActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
  triggers: { api: true },
};
