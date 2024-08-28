module.exports = {
  verbose: true,
  testRegex: [".*\\.test\\.ts$"],
  testPathIgnorePatterns: ["/node_modules/"],
  // Referred https://github.com/jest-community/jest-extended
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.json",
        diagnostics: true,
      },
    ],
  },
  moduleFileExtensions: ["ts", "js"],
  moduleDirectories: ["node_modules"],
  preset: "ts-jest",
  maxWorkers: "50%",
  coverageReporters: ['lcov'],
};
