#!/usr/bin/env node

import fs from 'fs';
import { execFileSync, execSync } from 'child_process';
import { logger } from '@jobscale/create-logger';

const envName = process.env.ENV;
const configs = {
  dev: { region: 'us-east-1' },
  stg: { region: 'ap-northeast-1' },
};
const config = configs[envName];

if (!config) {
  throw new Error(`Unknown env '${envName}'. Valid env are: ${Object.keys(configs).join(', ')}`);
}
const { region } = config;

const versionFile = 'lib/cdk/version';
const before = Number.parseInt(fs.readFileSync(versionFile, { encoding: 'utf8' }), 10);
if (!before) throw new Error(`Invalid version in ${versionFile}`);
const version = (before + 1).toString();
fs.writeFileSync(versionFile, version, { encoding: 'utf8' });
logger.info('Using version', version);

const repositories = [{
  repositoryName: 'zipcode-jp',
  baseTag: 'lambda',
  tagName: `lambda-debian-${version}`,
}, {
  repositoryName: 'news-top',
  baseTag: 'lambda',
  tagName: `lambda-debian-${version}`,
}];

const accountId = execFileSync(
  'aws',
  ['sts', 'get-caller-identity', '--query', 'Account', '--output', 'text'],
  { encoding: 'utf8' },
).trim();
const registry = `${accountId}.dkr.ecr.${region}.amazonaws.com`;
execSync(
  `aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${registry}`,
  { stdio: 'inherit', shell: 'bash' },
);

repositories.forEach(({ repositoryName, baseTag, tagName }) => {
  const baseImage = `ghcr.io/jobscale/${repositoryName}:${baseTag}`;
  const image = `${registry}/${repositoryName}:${tagName}`;
  logger.info({ baseImage, image });

  try {
    execFileSync('aws', [
      'ecr', 'describe-repositories',
      '--repository-names', repositoryName,
      '--region', region,
    ], { stdio: 'ignore' });
  } catch {
    execFileSync('aws', [
      'ecr', 'create-repository',
      '--repository-name', repositoryName,
      '--region', region,
    ], { stdio: 'inherit' });
  }

  execFileSync('docker', [
    'pull', baseImage,
  ], { stdio: 'inherit' });

  execFileSync('docker', [
    'tag', baseImage, image,
  ], { stdio: 'inherit' });

  execFileSync('docker', [
    'push', image,
  ], { stdio: 'inherit' });
});

logger.info('All images have been pushed successfully.');
