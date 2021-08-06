const { S3 } = require('aws-sdk');

const s3 = new S3();

class S3Service {
  createBucket(options) {
    const params = {
      Bucket: options.Bucket,
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-northeast-3',
      },
    };
    return s3.createBucket(params).promise();
  }
}

module.exports = {
  S3Service,
  s3Service: new S3Service(),
};
