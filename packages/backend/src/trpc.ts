import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { leaderboardScraper } from "./scrapers/leaderboard-scraper.js";
import { queryPlayerCount } from "./queries/query-player-count.js";
import { fullLeaderboardScraper } from "./scrapers/full-leaderboard-scraper.js";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  leaderboard: publicProcedure
    .input(
      z.object({
        gameName: z.string(),
        type: z.string().default("leaderboards1"),
        start: z.number().default(0),
        count: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        if (input.type === "leaderboards1") {
          const fullLeaderboardData = await fullLeaderboardScraper(
            input.gameName,
            input.start,
            input.count
          );

          return fullLeaderboardData;
        }

        const leaderboardData = await leaderboardScraper(
          input.gameName,
          input.type,
          input.start,
          input.count
        );

        return leaderboardData;
      } catch (e) {
        console.log(e);
        return [] as unknown as Awaited<typeof leaderboardScraper>;
      }
    }),
  playerCount: publicProcedure.query(async () => {
    const playerData = await queryPlayerCount();

    return playerData;
  }),
});

export type AppRouter = typeof appRouter;
