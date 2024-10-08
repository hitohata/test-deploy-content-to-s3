import * as cdk from 'aws-cdk-lib';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudFrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as iam from "aws-cdk-lib/aws-iam"
import { Construct } from 'constructs';

interface IProps extends cdk.StackProps {
  stage: "dev" | "prod";
}

export class DeployFrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id, props);

    const { stage } =  props;

    const contentBucket = new s3.Bucket(this, "ContentBucket", {
      bucketName: `content-bucket-bucket-bucket-${stage}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const bucketOrigin = new cloudFrontOrigins.S3Origin(contentBucket);

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: bucketOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      }
    })

    const bucketNameParameter = new ssm.StringParameter(this, "ContentBucketName", {
      parameterName: `/deploy/bucket/${stage}`,
      stringValue: contentBucket.bucketName
    })
    const distributionNameParameter = new ssm.StringParameter(this, "ContentDistributionName", {
      parameterName: `/deploy/distribution/${stage}`,
      stringValue: distribution.distributionId
    })

    new iam.User(this, "DeployUser", {
      userName: `UploadUser-${stage}`,
      managedPolicies: [
         new iam.ManagedPolicy(this, "DeploymentPolicyManaged", {
          document: new iam.PolicyDocument({
            statements: [
                new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["s3:PutObject"],
          resources: [contentBucket.bucketArn + "/*"]
        }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["cloudfront:CreateInvalidation"],
            resources: [`arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`]
          }),
                new iam.PolicyStatement({
                  effect: iam.Effect.ALLOW,
                  actions: ["ssm:GetParameter"],
                  resources: [
                      bucketNameParameter.parameterArn,
                      distributionNameParameter.parameterArn
                  ]
                })
            ]
          })
        })
      ]
    })
  }
}
