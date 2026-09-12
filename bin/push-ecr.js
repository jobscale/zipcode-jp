import { execFileSync, execSync } from 'child_process';

const envName = process.env.ENV;
const configs = {
  dev: { region: 'us-east-1' },
  stg: { region: 'ap-northeast-1' },
};
const config = configs[envName];

if (!config) {
  throw new Error(`Unknown env '${envName}'. Valid env are: ${Object.keys(configs).join(', ')}`);
}

const repositoryName = 'zipcode-jp';
const tagName = 'lambda-debian-17';

const { region } = config;
const accountId = execFileSync(
  'aws',
  ['sts', 'get-caller-identity', '--query', 'Account', '--output', 'text'],
  { encoding: 'utf8' },
).trim();
const registry = `${accountId}.dkr.ecr.${region}.amazonaws.com`;
const image = `${registry}/${repositoryName}:${tagName}`;

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

execSync(
  `aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${registry}`,
  { stdio: 'inherit', shell: '/bin/bash' },
);

execFileSync('docker', [
  'build',
  '--pull',
  '--platform', 'linux/amd64',
  '--file', 'lambda/debian/Dockerfile',
  '--tag', image,
  '.',
], { stdio: 'inherit' });

execFileSync('docker', ['push', image], { stdio: 'inherit' });
