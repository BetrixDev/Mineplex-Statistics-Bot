import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "./trpc.js";
import NodeCache from "node-cache";

async function main() {
  const app = express();

  app.get("/", (_req, res) => res.send("Server is running!"));

  app.use(
    "/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext: () => {
        return {
          cache: new NodeCache({ stdTTL: 60 * 15 }),
        };
      },
    })
  );
  app.listen(3000);
}

void main();
