module.exports = {
    moduleDirectories:['node_modules', '<rootDir>/src', '<rootDir>'],
    setupFiles:['<rootDir>/src/test/setupJest.js'],
    snapshotSerializers:[
        '<rootDir>/test/getFunctionsFromAstResultSerializer.js',
        '<rootDir>/test/astSerializer.js'
    ],
    coverageReporters: ["html"],
    coverageDirectory: 'reports/coverage',
    collectCoverageFrom: [
        "src/**/*.js",
        "!<rootDir>/lib/**",
        "!src/profiler.js",
        "!src/logger.js",
        "!src/test/**",
        "!src/**/test*.js",
        "!src/**/*.test.js"
    ]
}
