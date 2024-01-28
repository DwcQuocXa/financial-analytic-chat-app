import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Additional configurations like test path, coverage, etc.
};

export default config;
