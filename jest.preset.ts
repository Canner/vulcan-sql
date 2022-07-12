const nxPreset = require('@nrwl/jest/preset');

module.exports = { ...nxPreset, setupFilesAfterEnv: ['../../jest.setup.ts'] };
