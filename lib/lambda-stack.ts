import codedeploy = require('@aws-cdk/aws-codedeploy');
import lambda = require('@aws-cdk/aws-lambda');
import { App, Stack, StackProps, SecretValue } from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';

export class LambdaStack extends Stack {
  public readonly lambdaCode: lambda.CfnParametersCode;
  constructor(app: App, id: string, props?: StackProps) {
    super(app, id, props);

    this.lambdaCode = lambda.Code.fromCfnParameters();

    const func = new lambda.Function(this, 'Lambda', {
      code: this.lambdaCode,
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        SLACK_SIGNING_SECRET: SecretValue.secretsManager(
          'slack-signing-secret'
        ).toString(),
        SLACK_BOT_TOKEN: SecretValue.secretsManager(
          'slack-bot-token'
        ).toString()
      }
    });

    const version = func.addVersion(new Date().toISOString());
    const alias = new lambda.Alias(this, 'LambdaAlias', {
      aliasName: 'Prod',
      version
    });

    new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.ALL_AT_ONCE
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this, 'WeeklyChallenge', {
      handler: func
    });
  }
}
