import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const EnvSchema = z.discriminatedUnion("NODE_ENV", [
  z.object({
    NODE_ENV: z.literal("production"),
    API_ENDPOINT: z.string(),
    BOT_TOKEN: z.string(),
  }),
  z.object({
    NODE_ENV: z.literal("development"),
    BOT_TOKEN: z.string(),
  }),
]);

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  throw Error("Bad enviroment variables");
}

export default parsed.data;
