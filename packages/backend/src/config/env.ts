import { z } from "zod";

const backendEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(4000)
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;

export function loadBackendEnv(source: NodeJS.ProcessEnv = process.env): BackendEnv {
  const parsed = backendEnvSchema.safeParse(source);

  if (parsed.success) {
    return parsed.data;
  }

  const missingVariables = parsed.error.issues
    .map((issue) => issue.path.join("."))
    .filter(Boolean)
    .join(", ");

  throw new Error(
    `@zuam/backend env bootstrap failed. Missing or invalid variables: ${missingVariables}`
  );
}
