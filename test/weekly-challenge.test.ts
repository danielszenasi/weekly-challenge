import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import WeeklyChallenge = require('../lib/weekly-challenge-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new WeeklyChallenge.WeeklyChallengeStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
