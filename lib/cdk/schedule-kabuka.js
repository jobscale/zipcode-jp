import * as cdk from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as scheduler from 'aws-cdk-lib/aws-scheduler';
import * as targets from 'aws-cdk-lib/aws-scheduler-targets';

export const schedule = stack => {
  const repository = ecr.Repository.fromRepositoryName(stack, 'KabukaRepository',
    'kabuka',
  );
  const { version } = stack.context;
  const tagOrDigest = `lambda-${version}`;

  const container = new lambda.Function(stack, 'KabukaFunction', {
    functionName: `${stack.stackName}-kabuka`,
    logGroup: new logs.LogGroup(stack, 'KabukaFunctionLogGroup', {
      logGroupName: `/aws/lambda/${stack.stackName}-kabuka`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.SIX_MONTHS,
      logGroupClass: logs.LogGroupClass.INFREQUENT_ACCESS,
    }),
    loggingFormat: lambda.LoggingFormat.JSON,
    systemLogLevelV2: lambda.SystemLogLevel.INFO,
    code: lambda.EcrImageCode.fromEcrImage(repository, {
      tagOrDigest,
    }),
    handler: lambda.Handler.FROM_IMAGE,
    runtime: lambda.Runtime.FROM_IMAGE,
    timeout: cdk.Duration.seconds(300),
    memorySize: 360,
    environment: {
      ENV: stack.context.envName === 'stg' ? 'dev' : stack.context.envName,
    },
  });

  const { cron } = scheduler.ScheduleExpression;
  new scheduler.Schedule(stack, 'KabukaSchedule', {
    schedule: cron({
      minute: '33',
      hour: '9,15',
      weekDay: 'MON-FRI',
      timeZone: cdk.TimeZone.ASIA_TOKYO,
    }),
    target: new targets.LambdaInvoke(container, { retryAttempts: 0 }),
  });
};
