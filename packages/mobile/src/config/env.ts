import { z } from "zod";

const mobileEnvSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.string().url()
});

export type MobileEnv = z.infer<typeof mobileEnvSchema>;

export function loadMobileEnv(source: NodeJS.ProcessEnv = process.env): MobileEnv {
  const parsed = mobileEnvSchema.safeParse(source);

  if (parsed.success) {
    return parsed.data;
  }

  const missingVariables = parsed.error.issues
    .map((issue) => issue.path.join("."))
    .filter(Boolean)
    .join(", ");

  throw new Error(
    `@zuam/mobile env bootstrap failed. Missing or invalid variables: ${missingVariables}`
  );
}
