module.exports = {
  displayName: "backend",
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^shared$": "<rootDir>/../shared/src/index.ts",
    "^shared/(.*)$": "<rootDir>/../shared/src/$1",
    "^src/(.*)\\.js$": "<rootDir>/src/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.interface.ts",
    "!src/**/index.ts",
    "!src/env.ts",
    "!src/config/**",
    "!src/containers/**",
  ],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/__tests__/", "/generated/"],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tsconfig.json",
      },
    ],
  },
};
