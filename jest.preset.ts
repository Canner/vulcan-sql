const nxPreset = require('@nx/jest/preset').default;

module.exports = { ...nxPreset, setupFilesAfterEnv: ['../../jest.setup.ts'] };
