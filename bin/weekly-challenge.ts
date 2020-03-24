#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { WeeklyChallengeStack } from '../lib/weekly-challenge-stack';

const app = new cdk.App();
new WeeklyChallengeStack(app, 'WeeklyChallengeStack');
