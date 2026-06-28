import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "osuConnection" model, go to https://osu-stats.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "G4m3cpj_3BEY",
  fields: {
    discordAccessToken: {
      type: "string",
      storageKey: "BQa94YM_itSE",
    },
    discordId: { type: "string", storageKey: "VI-wDvXb2_y5" },
    osuId: { type: "string", storageKey: "3vuWTxvZUgI-" },
    osuUsername: { type: "string", storageKey: "wrgDSvxXBgSz" },
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey: "G4m3cpj_3BEY-BelongsTo-User",
    },
  },
};
