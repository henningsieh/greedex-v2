import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    GOOGLE_CLIENT_ID: z
      .string()
      .refine((value) => value.endsWith("apps.googleusercontent.com"), {
        message: "Must end with apps.googleusercontent.com",
      })
      .refine(
        (value) => {
          const firstTwelve = value.slice(0, 12);
          return (
            firstTwelve.length === 12 &&
            [...firstTwelve].every((char) => char >= "0" && char <= "9")
          );
        },
        {
          message: "Must start with twelve digits",
        },
      ),
    GOOGLE_CLIENT_SECRET: z
      .string()
      .refine((value) => value.startsWith("GOCSPX"), {
        message: "Must start with GOCSPX",
      }),
    DISCORD_CLIENT_ID: z.string().min(19),
    DISCORD_CLIENT_SECRET: z.string().length(32),
    GITHUB_CLIENT_ID: z.string().length(20),
    GITHUB_CLIENT_SECRET: z.string().length(40),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z
        .number()
        .int()
        .refine((v) => v === 465 || v === 587, {
          message: "SMTP_PORT must be 465 or 587",
        }),
    ),
    SMTP_SENDER: z.email(),
    SMTP_USERNAME: z.string().min(1),
    SMTP_PASSWORD: z.string().min(1),
    SMTP_SECURE: z
      .string()
      .refine((value) => value === "true" || value === "false", {
        message: "Must be 'true' or 'false'",
      })
      .transform((value) => value === "true"),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SENDER: process.env.SMTP_SENDER,
    SMTP_USERNAME: process.env.SMTP_USERNAME,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_SECURE: process.env.SMTP_SECURE,
  },
});
