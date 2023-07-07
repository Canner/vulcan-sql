module.exports = {
  displayName: 'extension-driver-clickhouse',
  preset: '../../jest.preset.ts',
  // Use node environment to avoid facing "TypeError: The "listener" argument must be of type function. Received an instance of Object" error
  // when using clickhouse client executing query in the jest environment.
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
  coverageDirectory: '../../coverage/packages/extension-driver-clickhouse',
};
