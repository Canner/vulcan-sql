module.exports = {
  displayName: 'extension-huggingface',
  preset: '../../jest.preset.ts',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/extension-huggingface',
};
