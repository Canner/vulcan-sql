module.exports = {
  displayName: 'extension-driver-canner',
  preset: '../../jest.preset.ts',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html', 'node'],
  coverageDirectory: '../../coverage/packages/extension-driver-canner',
  testEnvironment: 'node',
};
