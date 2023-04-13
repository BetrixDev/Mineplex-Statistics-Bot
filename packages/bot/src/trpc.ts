import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "backend";
import "isomorphic-fetch";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});
