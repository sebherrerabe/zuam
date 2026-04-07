module.exports = {
  rootDir: ".",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        diagnostics: {
          ignoreCodes: [5101]
        }
      }
    ]
  },
  testMatch: ["<rootDir>/test/**/*.spec.ts"]
};
