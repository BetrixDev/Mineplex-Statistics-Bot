import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "backend";
import "isomorphic-fetch";
import env from "./env.js";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url:
        env.NODE_ENV === "production"
          ? env.API_ENDPOINT
          : "http://localhost:3000/trpc",
    }),
  ],
});
