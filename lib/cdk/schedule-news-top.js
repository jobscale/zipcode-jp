import * as cdk from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as scheduler from 'aws-cdk-lib/aws-scheduler';
import * as targets from 'aws-cdk-lib/aws-scheduler-targets';

export const schedule = stack => {
  const repository = ecr.Repository.fromRepositoryName(stack, 'NewsTopRepository',
    'news-top',
  );
  const { version } = stack.context;
  const tagOrDigest = `lambda-debian-${version}`;

  const container = new lambda.Function(stack, 'NewsTopFunction', {
    functionName: `${stack.stackName}-news-top`,
    logGroup: new logs.LogGroup(stack, 'NewsTopFunctionLogGroup', {
      logGroupName: `/aws/lambda/${stack.stackName}-news-top`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.SIX_MONTHS,
    }),
    code: lambda.EcrImageCode.fromEcrImage(repository, {
      tagOrDigest,
    }),
    handler: lambda.Handler.FROM_IMAGE,
    runtime: lambda.Runtime.FROM_IMAGE,
    timeout: cdk.Duration.seconds(300),
    memorySize: 300,
    environment: {
      ENV: stack.context.envName === 'stg' ? 'dev' : stack.context.envName,
    },
  });

  const { cron } = scheduler.ScheduleExpression;
  new scheduler.Schedule(stack, 'NewsTopSchedule', {
    schedule: cron({ minute: '9-55/11', hour: '*', day: '*', month: '*', year: '*' }),
    target: new targets.LambdaInvoke(container, { retryAttempts: 0 }),
  });
};
