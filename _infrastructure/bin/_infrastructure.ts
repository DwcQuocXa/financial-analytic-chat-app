#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ECRStack } from '../lib/ecr-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

new ECRStack(app, 'ECRStack', {
    env: { account: '476194719932', region: 'eu-west-1' },
});

new PipelineStack(app, 'PipelineStack', {
    env: { account: '476194719932', region: 'eu-west-1' },
});
