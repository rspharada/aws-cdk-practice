#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CdkCloudFrontS3StaticWebSiteStack } from '../lib/cdk-cloud-front-s3-static-website-stack'
import { CdkLambdaEdgeStack } from '../lib/cdk-lambda-edge-stack'
import 'dotenv/config'

const app = new cdk.App()

// 参照される側のスタック
const cdkLambdaEdgeStack = new CdkLambdaEdgeStack(app, 'CdkLambdaEdgeStack', {
	env: {
		region: 'us-east-1',
	},
})

// 参照する側のスタック
const cdkCloudFrontS3StaticWebSiteStack = new CdkCloudFrontS3StaticWebSiteStack(
	app,
	'CdkCloudFrontS3StaticWebSiteStack',
	{
		/* If you don't specify 'env', this stack will be environment-agnostic.
		 * Account/Region-dependent features and context lookups will not work,
		 * but a single synthesized template can be deployed anywhere. */
		/* Uncomment the next line to specialize this stack for the AWS Account
		 * and Region that are implied by the current CLI configuration. */
		// env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
		/* Uncomment the next line if you know exactly what Account and Region you
		 * want to deploy the stack to. */
		// env: { account: '123456789012', region: 'us-east-1' },
		/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
		env: {
			region: 'ap-northeast-1',
		},
	},
)

// 両スタックの依存関係を明示的に定義する。
cdkCloudFrontS3StaticWebSiteStack.addDependency(cdkLambdaEdgeStack)
