module.exports = {
  rootDir: ".",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tooling/tests/**/*.test.cjs"],
  modulePathIgnorePatterns: ["<rootDir>/.claude/worktrees/"]
};
