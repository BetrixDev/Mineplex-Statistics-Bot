import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const EnvSchema = z.object({
  BOT_TOKEN: z.string(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  throw "Bad enviroment variables";
}

export default parsed.data;
