import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { db } from "./db";

export const auth = betterAuth({
  database: db,
  emailAndPassword: { enabled: true },
  plugins: [nextCookies()],
});

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
