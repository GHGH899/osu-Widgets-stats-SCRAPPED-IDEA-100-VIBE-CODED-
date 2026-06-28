import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://osu-stats.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Nyj11zYHJU6y",
  fields: {
    email: {
      type: "email",
      validations: { required: true, unique: true },
      storageKey:
        "ModelField-crTKjwOaKlUE::FieldStorageEpoch-Ze649KTWeyb_",
      searchIndex: false,
    },
    emailVerificationToken: {
      type: "string",
      storageKey:
        "ModelField-82NvRtKGilut::FieldStorageEpoch-B-Y-a_GVUxDB",
      searchIndex: false,
    },
    emailVerificationTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey:
        "ModelField-OsBSD5MOzA2l::FieldStorageEpoch-GGhGVqRAFCvx",
      filterIndex: false,
      searchIndex: false,
    },
    emailVerified: {
      type: "boolean",
      default: false,
      storageKey:
        "ModelField-HwldjUb0YzNq::FieldStorageEpoch-5MrG4M45WRgm",
      searchIndex: false,
    },
    firstName: {
      type: "string",
      storageKey:
        "ModelField-qUOjeubWthFe::FieldStorageEpoch-uv7WOHGFfBru",
      filterIndex: false,
      searchIndex: false,
    },
    googleImageUrl: {
      type: "url",
      storageKey:
        "ModelField-RZGeKn08rlZ6::FieldStorageEpoch-E8yypcYjSm1Y",
      filterIndex: false,
      searchIndex: false,
    },
    googleProfileId: {
      type: "string",
      storageKey:
        "ModelField-5jMLDOB9H4gx::FieldStorageEpoch-gYzUuomkOIhV",
      filterIndex: false,
      searchIndex: false,
    },
    lastName: {
      type: "string",
      storageKey:
        "ModelField-iGH5npvYRO8R::FieldStorageEpoch-surRiXOJq7a2",
      filterIndex: false,
      searchIndex: false,
    },
    lastSignedIn: {
      type: "dateTime",
      includeTime: true,
      storageKey:
        "ModelField-Awdog48lm9c3::FieldStorageEpoch-Qc7DaRV8I_0t",
      filterIndex: false,
      searchIndex: false,
    },
    password: {
      type: "password",
      validations: { strongPassword: true },
      storageKey:
        "ModelField-p7gIwwPn7L3v::FieldStorageEpoch-is-GJJ-lamK0",
    },
    resetPasswordToken: {
      type: "string",
      storageKey:
        "ModelField-jyWxcriAtTMx::FieldStorageEpoch-Sl9I8H0AMBFd",
      searchIndex: false,
    },
    resetPasswordTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey:
        "ModelField-g-Qow64Ubsky::FieldStorageEpoch-Vpvgb89mdZoc",
      filterIndex: false,
      searchIndex: false,
    },
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey:
        "ModelField-F06oCeGumY8X::FieldStorageEpoch-Nh7JBGY1Ptv-",
      searchIndex: false,
    },
  },
  searchIndex: false,
};
