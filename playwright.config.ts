import { defineConfig, devices } from "@playwright/test";
import { AUTH_STATE_PATH } from "./tests/global-setup";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  globalSetup: "./tests/global-setup",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  projects: [
    // Unauthenticated tests (auth UI checks)
    {
      name: "auth-ui",
      testMatch: "**/auth.test.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    // All feature tests — load pre-authenticated session
    {
      name: "features",
      testMatch: "**/features.test.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STATE_PATH,
      },
    },
  ],
});
