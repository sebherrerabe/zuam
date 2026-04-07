import { themeTokens, typographyTokens } from "@zuam/shared/theme";

export const shellTheme = {
  accent: themeTokens.color.accentPrimary.light,
  accentDark: themeTokens.color.accentPrimary.dark,
  bodyFont: typographyTokens.body,
  monoFont: typographyTokens.mono
} as const;
