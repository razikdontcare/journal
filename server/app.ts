import "react-router";
import { createRequestHandler } from "@react-router/express";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../app/lib/auth.server";
import uploadRouter from "./upload";

declare module "react-router" {
  interface AppLoadContext {
    VALUE_FROM_EXPRESS: string;
  }
}

export const app = express();

// Better Auth API handler - must be before React Router handler
app.all("/api/auth/*splat", toNodeHandler(auth));

// Upload API handler
app.use("/api/upload", uploadRouter);

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
    getLoadContext() {
      return {
        VALUE_FROM_EXPRESS: "Hello from Express",
      };
    },
  })
);
