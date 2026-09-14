import fs from 'fs';
import * as cdk from 'aws-cdk-lib/core';
import { logger } from '@jobscale/create-logger';
import { serverlessGateway } from './cdk/serverless.js';

export class AppStack extends cdk.Stack {
  constructor(scope, id, props = {}) {
    const { envName = 'dev', ...stackProps } = props;
    super(scope, id, stackProps);

    cdk.Tags.of(this).add('Env', envName);

    const versionFile = 'lib/cdk/version';
    const version = Number.parseInt(fs.readFileSync(versionFile, { encoding: 'utf8' }), 10);
    if (!version) throw new Error(`Invalid version in ${versionFile}`);

    this.context = {
      envName,
      ...stackProps,
      version,
      start: Date.now(),
    };
    logger.info({
      stackName: this.stackName,
      env: this.env,
      context: this.context,
    });

    serverlessGateway(this);
  }
}
