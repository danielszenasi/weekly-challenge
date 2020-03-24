#!/usr/bin/env node

import { App } from '@aws-cdk/core';
import { LambdaStack } from '../lib/lambda-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new App();

const lambdaStack = new LambdaStack(app, 'LambdaStack');
new PipelineStack(app, 'PipelineDeployingWeeklyChallengeStack', {
  lambdaCode: lambdaStack.lambdaCode
});

app.synth();
