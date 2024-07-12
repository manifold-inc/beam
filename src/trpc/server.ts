
import { cookies } from "next/headers";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import { getUrl, transformer } from "./shared";
import {type AppRouter} from 'server/routers/_app'

export const serverClient = createTRPCProxyClient<AppRouter>({
  transformer,
  links: [
    httpBatchLink({
      url: getUrl(),
      headers() {
        return {
          cookie: cookies().toString(),
          "x-trpc-source": "rsc",
        };
      },
    }),
  ],
});
