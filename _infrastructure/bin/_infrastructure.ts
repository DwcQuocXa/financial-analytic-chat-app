#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ECRStack } from '../lib/ecr-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

new ECRStack(app, 'ECRStack');

new PipelineStack(app, 'PipelineStack');
