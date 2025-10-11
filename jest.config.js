/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testPathIgnorePatterns: [
    "/node_modules/",
    "/app/"
  ],
  testEnvironment: "jsdom",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};