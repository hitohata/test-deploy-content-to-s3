import * as cdk from 'aws-cdk-lib';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudFrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import { Construct } from 'constructs';

export class DeployFrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const contentBucket = new s3.Bucket(this, "ContentBucket", {
      bucketName: "content-bucket-bucket-bucket",
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const bucketOrigin = new cloudFrontOrigins.S3Origin(contentBucket);

    new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin:  bucketOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD
      }
    })

  }
}
