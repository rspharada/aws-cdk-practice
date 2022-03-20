import { Stack, StackProps, aws_lambda as lambda, Duration } from 'aws-cdk-lib'
import { join } from 'path'
import { Construct } from 'constructs'

// 環境変数の型を定義する。
interface StageContext {
	name: string
	description: string
}

export class CreateLambdaStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props)

		const env: string = this.node.tryGetContext('env')
		const context: StageContext = this.node.tryGetContext(env)

		// Create Lambda Function
		// 参考：https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda.Function.html
		new lambda.Function(this, 'LambdaFunction', {
			functionName: `ckd-sample-${context.name}-lambda`,
			description: `${context.description}`,
			handler: 'index.handler',
			runtime: lambda.Runtime.NODEJS_14_X,
			timeout: Duration.minutes(5),
			code: lambda.Code.fromAsset(join(__dirname, '../src/function')),
			// 環境変数を定義する。
			environment: {
				NAME: context.name,
			},
		})
	}
}
