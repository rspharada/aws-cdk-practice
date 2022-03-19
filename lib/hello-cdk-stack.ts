import { Stack, StackProps, aws_s3 as s3 } from 'aws-cdk-lib'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class HelloCdkStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props)
		// AWS S3にバケット「hello-world-bucket-202203190000」を追加する
		// バケットのバージョニングを有効に設定
		const bucket: string =
			process.env.S3_BUCKET_NAME !== undefined ? process.env.S3_BUCKET_NAME : ''
		new s3.Bucket(this, bucket, {
			versioned: true,
		})
	}
}
