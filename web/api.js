import { Client } from "@gadget-client/osu-stats";

export const api = new Client({ environment: window.gadgetConfig.environment });
