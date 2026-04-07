import { z } from "zod";

const desktopEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url()
});

export type DesktopEnv = z.infer<typeof desktopEnvSchema>;

export function loadDesktopEnv(
  source: Record<string, string | undefined>
): DesktopEnv {
  const parsed = desktopEnvSchema.safeParse(source);

  if (parsed.success) {
    return parsed.data;
  }

  const missingVariables = parsed.error.issues
    .map((issue) => issue.path.join("."))
    .filter(Boolean)
    .join(", ");

  throw new Error(
    `@zuam/desktop env bootstrap failed. Missing or invalid variables: ${missingVariables}`
  );
}
