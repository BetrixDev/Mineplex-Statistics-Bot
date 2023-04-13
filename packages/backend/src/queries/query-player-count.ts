import axios from "axios";
import { z } from "zod";

const ResponseSchema = z
  .discriminatedUnion("online", [
    z.object({
      online: z.literal(true),
      players: z.object({
        online: z.number(),
      }),
    }),
    z.object({
      online: z.literal(false),
      players: z.null(),
    }),
  ])
  .transform((ctx) => {
    if (ctx.online) {
      return {
        online: true,
        playerCount: ctx.players.online,
      };
    } else {
      return {
        online: false,
        playerCount: null,
      };
    }
  });

export const queryPlayerCount = async () => {
  const response = await axios("https://api.mcsrvstat.us/2/us.mineplex.com");

  const parsedResponse = ResponseSchema.safeParse(response.data);

  if (!parsedResponse.success) {
    throw Error("Malformed data");
  }

  return parsedResponse.data;
};
