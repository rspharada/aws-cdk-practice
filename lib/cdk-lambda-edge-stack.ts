import {
	Stack,
	StackProps,
	aws_cloudfront as cloudfront,
	aws_lambda as lambda,
	Duration,
	CfnOutput,
	Fn,
} from 'aws-cdk-lib'
import { join } from 'path'
import { Construct } from 'constructs'
import { StageContext } from './interface'

export class CdkLambdaEdgeStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props)
		// 1. Lambda@Edge関数を作成する
		// https://docs.aws.amazon.com/cdk/api/v1/docs/aws-cloudfront-readme.html#lambdaedge
		const env: string = this.node.tryGetContext('env')
		const context: StageContext = this.node.tryGetContext(env)
		const websiteBasicAuthFunction = new cloudfront.experimental.EdgeFunction(
			this,
			'websiteBasicAuthFunction',
			{
				functionName: context.name,
				description: `${context.description}`,
				handler: 'index.handler',
				runtime: lambda.Runtime.NODEJS_14_X,
				timeout: Duration.minutes(5),
				code: lambda.Code.fromAsset(
					join(__dirname, `../src/lambdaEdge/${env}`),
				),
			},
		)
		// 2.Lambda@EdgeのARNを出力する。
		new CfnOutput(this, 'CdkLambdaEdgeStackArnOutput', {
			exportName: 'websiteBasicAuthFunctionArn',
			value: websiteBasicAuthFunction.functionArn,
		})
	}
}
