module.exports = {
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
  ],
  // moduleDirectories: ["node_modules", "src"],
  transform: {
     '^.+\\.(js|jsx)?$': 'babel7-jest'
  },
  testMatch: [
    '**/tests/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
  ],
  testURL: 'http://localhost/',
  collectCoverage: true,
  coverageReporters: ['html', 'text-summary'],
  collectCoverageFrom: [
    '**/*.{js,vue}', '!**/node_modules/**'
  ]
}
