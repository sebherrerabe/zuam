module.exports = {
  rootDir: ".",
  preset: "jest-expo",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  moduleNameMapper: {
    "^expo-modules-core$": "<rootDir>/node_modules/expo-modules-core",
    "^expo-modules-core/(.*)$": "<rootDir>/node_modules/expo-modules-core/$1"
  }
};
