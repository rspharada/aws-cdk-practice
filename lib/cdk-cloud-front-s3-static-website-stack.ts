import {
	Stack,
	StackProps,
	aws_s3 as s3,
	RemovalPolicy,
	aws_iam as iam,
	aws_cloudfront as cloudfront,
	aws_s3_deployment as s3Deployment,
	aws_lambda as lambda,
} from 'aws-cdk-lib'
import { join } from 'path'
import { Construct } from 'constructs'
import { StageContext } from './interface'

export class CdkCloudFrontS3StaticWebSiteStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props)
		const env: string = this.node.tryGetContext('env')
		const context: StageContext = this.node.tryGetContext(env)

		// 1. OriginとなるS3 Bucket作成する。
		const bucketName: string = this.node
			.tryGetContext('s3')
			.bucketName.replace('#ENV#', env)
		const websiteBucket = new s3.Bucket(this, 'S3Bucket', {
			// s3バケット名を設定する。
			bucketName: bucketName,
			// Bucketへの直接アクセス禁止する。
			accessControl: s3.BucketAccessControl.PRIVATE,
			// SES-3暗号化を有効にします。
			encryption: s3.BucketEncryption.S3_MANAGED,
			// バブリックアクセスをブロックする。
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			// バージョニングを有効にする。
			versioned: true,
			// CDK Stack削除時にBucketも削除する。
			removalPolicy: RemovalPolicy.DESTROY,
			// 静的ウェブサイトホスティングを設定する。
			websiteIndexDocument: 'index.html',
			websiteErrorDocument: 'index.html',
		})
		// 2. Origin Access Identity作成する。
		const websiteIdentity = new cloudfront.OriginAccessIdentity(
			this,
			'WebsiteIdentity',
			{
				comment: 'website-identity',
			},
		)
		// 3. Origin Access Identityからのアクセスのみを許可するBucket Policyを作成する。
		const webSiteBucketPolicyStatement = new iam.PolicyStatement({
			effect: iam.Effect.ALLOW,
			actions: ['s3:GetObject'],
			resources: [`${websiteBucket.bucketArn}/*`],
			principals: [
				new iam.CanonicalUserPrincipal(
					websiteIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId,
				),
			],
		})

		// 4. Bucket PolicyをS3 Bucketに適用する。
		websiteBucket.addToResourcePolicy(webSiteBucketPolicyStatement)

		// 5. Lambda@Edge関数を作成する
		// https://docs.aws.amazon.com/cdk/api/v1/docs/aws-cloudfront-readme.html#lambdaedge
		const websiteBasicAuthFunction = new cloudfront.experimental.EdgeFunction(
			this,
			'websiteBasicAuthFunction',
			{
				functionName: context.name,
				description: `${context.description}`,
				handler: 'index.handler',
				runtime: lambda.Runtime.NODEJS_14_X,
				code: lambda.Code.fromAsset(
					join(__dirname, `../src/lambdaEdge/${env}`),
				),
			},
		)

		// 5. CloudFront Distributionを作成
		const websiteDistribution = new cloudfront.CloudFrontWebDistribution(
			this,
			'WebsiteDistribution',
			{
				comment: 'website-distribution',
				errorConfigurations: [
					{
						errorCachingMinTtl: 300,
						errorCode: 403,
						responseCode: 200,
						responsePagePath: '/index.html',
					},
					{
						errorCachingMinTtl: 300,
						errorCode: 404,
						responseCode: 200,
						responsePagePath: '/index.html',
					},
				],
				// 6. DistributionにOrigin情報（S3 Bucket、Origin Access Identity）を設定
				originConfigs: [
					{
						s3OriginSource: {
							s3BucketSource: websiteBucket,
							originAccessIdentity: websiteIdentity,
						},
						behaviors: [
							{
								allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD,
								cachedMethods:
									cloudfront.CloudFrontAllowedCachedMethods.GET_HEAD,
								isDefaultBehavior: true,
								viewerProtocolPolicy:
									cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
								// 関数の関連付け
								lambdaFunctionAssociations: [
									{
										eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
										lambdaFunction: websiteBasicAuthFunction.currentVersion,
										includeBody: false,
									},
								],
							},
						],
					},
				],
				// 料金クラス：北米、欧州、アジア、中東、アフリカを使用する
				priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
			},
		)

		// S3に静的ファイルをアップロードする。
		new s3Deployment.BucketDeployment(this, 'WebsiteDeploy', {
			sources: [s3Deployment.Source.asset('./src/web/build')],
			destinationBucket: websiteBucket,
			distribution: websiteDistribution,
			distributionPaths: ['/*'],
		})
	}
}
