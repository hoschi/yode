module.exports = {
    moduleDirectories:['node_modules', '<rootDir>/src', '<rootDir>'],
    coverageReporters: ["html"],
    coverageDirectory: 'reports/coverage',
    coveragePathIgnorePatterns: [
        "<rootDir>/lib/",
        "src/profiler.js"
    ]
}
