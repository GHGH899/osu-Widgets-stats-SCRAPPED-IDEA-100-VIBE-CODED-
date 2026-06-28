import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "game" model, go to https://osu-stats.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-UF7tdI4ebLdS",
  fields: {
    messageId: {
      type: "string",
      validations: { required: true },
      storageKey:
        "ModelField-E5DvP36D6r9q::FieldStorageEpoch-IEmn_gA3I7Y4",
      searchIndex: false,
    },
    objectName: {
      type: "string",
      validations: { required: true },
      storageKey:
        "ModelField-lOWktFGCOnqv::FieldStorageEpoch--J3oHMZDUrtj",
      filterIndex: false,
      searchIndex: false,
    },
    userId: {
      type: "string",
      validations: { required: true },
      storageKey:
        "ModelField-_cvO4TR3aEH1::FieldStorageEpoch-xL3LCSQn4AJ0",
      searchIndex: false,
    },
  },
  searchIndex: false,
};
