import * as cdk from 'aws-cdk-lib/core';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export const route = (stack, { httpApi, integrationArn, sourceArn }) => {
  const repository = ecr.Repository.fromRepositoryName(stack, 'ZipcodeJpRepository',
    'zipcode-jp',
  );
  const tagOrDigest = 'lambda-debian-17';

  const container = new lambda.Function(stack, 'ProxyFunction', {
    functionName: `${stack.stackName}-proxy`,
    logGroup: new logs.LogGroup(stack, 'ProxyFunctionLogGroup', {
      logGroupName: `/aws/lambda/${stack.stackName}-proxy`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.SIX_MONTHS,
    }),
    code: lambda.EcrImageCode.fromEcrImage(repository, {
      tagOrDigest,
    }),
    handler: lambda.Handler.FROM_IMAGE,
    runtime: lambda.Runtime.FROM_IMAGE,
    timeout: cdk.Duration.seconds(12),
    memorySize: 200,
    environment: {
      ENV: stack.context.envName === 'stg' ? 'dev' : stack.context.envName,
    },
  });

  const integration = new apigwv2.CfnIntegration(stack, 'ProxyIntegration', {
    apiId: httpApi.ref,
    integrationType: 'AWS_PROXY',
    integrationUri: cdk.Fn.sub(integrationArn, {
      LambdaArn: container.functionArn,
    }),
    payloadFormatVersion: '2.0',
    integrationMethod: 'POST',
  });

  new apigwv2.CfnRoute(stack, 'ProxyRoute', {
    apiId: httpApi.ref,
    routeKey: 'ANY /{proxy+}',
    target: cdk.Fn.join('', ['integrations/', integration.ref]),
  });

  container.addPermission('HttpApiInvokePermission', {
    principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    action: 'lambda:InvokeFunction',
    sourceArn,
  });
};
