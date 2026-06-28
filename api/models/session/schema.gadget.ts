import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "session" model, go to https://osu-stats.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-s6M5_oiYooo0",
  fields: {
    user: {
      type: "belongsTo",
      parent: { model: "user" },
      storageKey:
        "ModelField-0CYnWjNNdoA0::FieldStorageEpoch-uRSHSK8OEl16",
    },
  },
};
