export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/", // Add this line to ignore the dist folder
    ],
};