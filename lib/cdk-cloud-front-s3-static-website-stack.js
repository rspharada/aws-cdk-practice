"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkCloudFrontS3StaticWebSiteStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const path_1 = require("path");
class CdkCloudFrontS3StaticWebSiteStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const env = this.node.tryGetContext('env');
        const context = this.node.tryGetContext(env);
        // 1. OriginとなるS3 Bucket作成する。
        const bucketName = this.node
            .tryGetContext('s3')
            .bucketName.replace('#ENV#', env);
        const websiteBucket = new aws_cdk_lib_1.aws_s3.Bucket(this, 'S3Bucket', {
            // s3バケット名を設定する。
            bucketName: bucketName,
            // Bucketへの直接アクセス禁止する。
            accessControl: aws_cdk_lib_1.aws_s3.BucketAccessControl.PRIVATE,
            // SES-3暗号化を有効にします。
            encryption: aws_cdk_lib_1.aws_s3.BucketEncryption.S3_MANAGED,
            // バブリックアクセスをブロックする。
            blockPublicAccess: aws_cdk_lib_1.aws_s3.BlockPublicAccess.BLOCK_ALL,
            // バージョニングを有効にする。
            versioned: true,
            // CDK Stack削除時にBucketも削除する。
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
            // 静的ウェブサイトホスティングを設定する。
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
        });
        // 2. Origin Access Identity作成する。
        const websiteIdentity = new aws_cdk_lib_1.aws_cloudfront.OriginAccessIdentity(this, 'WebsiteIdentity', {
            comment: 'website-identity',
        });
        // 3. Origin Access Identityからのアクセスのみを許可するBucket Policyを作成する。
        const webSiteBucketPolicyStatement = new aws_cdk_lib_1.aws_iam.PolicyStatement({
            effect: aws_cdk_lib_1.aws_iam.Effect.ALLOW,
            actions: ['s3:GetObject'],
            resources: [`${websiteBucket.bucketArn}/*`],
            principals: [
                new aws_cdk_lib_1.aws_iam.CanonicalUserPrincipal(websiteIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId),
            ],
        });
        // 4. Bucket PolicyをS3 Bucketに適用する。
        websiteBucket.addToResourcePolicy(webSiteBucketPolicyStatement);
        // 5. Lambda@Edge関数を作成する
        // https://docs.aws.amazon.com/cdk/api/v1/docs/aws-cloudfront-readme.html#lambdaedge
        const websiteBasicAuthFunction = new aws_cdk_lib_1.aws_cloudfront.experimental.EdgeFunction(this, 'websiteBasicAuthFunction', {
            functionName: context.name,
            description: `${context.description}`,
            handler: 'index.handler',
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.NODEJS_14_X,
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset(path_1.join(__dirname, `../src/lambdaEdge/${env}`)),
        });
        // 5. CloudFront Distributionを作成
        const websiteDistribution = new aws_cdk_lib_1.aws_cloudfront.CloudFrontWebDistribution(this, 'WebsiteDistribution', {
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
                            allowedMethods: aws_cdk_lib_1.aws_cloudfront.CloudFrontAllowedMethods.GET_HEAD,
                            cachedMethods: aws_cdk_lib_1.aws_cloudfront.CloudFrontAllowedCachedMethods.GET_HEAD,
                            isDefaultBehavior: true,
                            viewerProtocolPolicy: aws_cdk_lib_1.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                            // 関数の関連付け
                            lambdaFunctionAssociations: [
                                {
                                    eventType: aws_cdk_lib_1.aws_cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
                                    lambdaFunction: websiteBasicAuthFunction.currentVersion,
                                    includeBody: false,
                                },
                            ],
                        },
                    ],
                },
            ],
            // 料金クラス：北米、欧州、アジア、中東、アフリカを使用する
            priceClass: aws_cdk_lib_1.aws_cloudfront.PriceClass.PRICE_CLASS_200,
        });
        // S3に静的ファイルをアップロードする。
        new aws_cdk_lib_1.aws_s3_deployment.BucketDeployment(this, 'WebsiteDeploy', {
            sources: [aws_cdk_lib_1.aws_s3_deployment.Source.asset('./src/web/build')],
            destinationBucket: websiteBucket,
            distribution: websiteDistribution,
            distributionPaths: ['/*'],
        });
    }
}
exports.CdkCloudFrontS3StaticWebSiteStack = CdkCloudFrontS3StaticWebSiteStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLWNsb3VkLWZyb250LXMzLXN0YXRpYy13ZWJzaXRlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLWNsb3VkLWZyb250LXMzLXN0YXRpYy13ZWJzaXRlLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQVNvQjtBQUNwQiwrQkFBMkI7QUFJM0IsTUFBYSxpQ0FBa0MsU0FBUSxtQkFBSztJQUMzRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1FBQzNELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ3ZCLE1BQU0sR0FBRyxHQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2xELE1BQU0sT0FBTyxHQUFpQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUUxRCw2QkFBNkI7UUFDN0IsTUFBTSxVQUFVLEdBQVcsSUFBSSxDQUFDLElBQUk7YUFDbEMsYUFBYSxDQUFDLElBQUksQ0FBQzthQUNuQixVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNsQyxNQUFNLGFBQWEsR0FBRyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDckQsZ0JBQWdCO1lBQ2hCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLHNCQUFzQjtZQUN0QixhQUFhLEVBQUUsb0JBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPO1lBQzdDLG1CQUFtQjtZQUNuQixVQUFVLEVBQUUsb0JBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVO1lBQzFDLG9CQUFvQjtZQUNwQixpQkFBaUIsRUFBRSxvQkFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVM7WUFDakQsaUJBQWlCO1lBQ2pCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsNEJBQTRCO1lBQzVCLGFBQWEsRUFB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QUFZLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUN4RCxPQUFPLEVBQUUsQ0FBQywrQkFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN2RCxpQkFBaUIsRUFBRSxhQUFhO1lBQ2hDLFlBQVksRUFBRSxtQkFBbUI7WUFDakMsaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUM7U0FDekIsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUNEO0FBOUhELDhFQThIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdFN0YWNrLFxuXHRTdGFja1Byb3BzLFxuXHRhd3NfczMgYXMgczMsXG5cdFJlbW92YWxQb2xpY3ksXG5cdGF3c19pYW0gYXMgaWFtLFxuXHRhd3NfY2xvdWRmcm9udCBhcyBjbG91ZGZyb250LFxuXHRhd3NfczNfZGVwbG95bWVudCBhcyBzM0RlcGxveW1lbnQsXG5cdGF3c19sYW1iZGEgYXMgbGFtYmRhLFxufSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cydcbmltcG9ydCB7IFN0YWdlQ29udGV4dCB9IGZyb20gJy4vaW50ZXJmYWNlJ1xuXG5leHBvcnQgY2xhc3MgQ2RrQ2xvdWRGcm9udFMzU3RhdGljV2ViU2l0ZVN0YWNrIGV4dGVuZHMgU3RhY2sge1xuXHRjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IFN0YWNrUHJvcHMpIHtcblx0XHRzdXBlcihzY29wZSwgaWQsIHByb3BzKVxuXHRcdGNvbnN0IGVudjogc3RyaW5nID0gdGhpcy5ub2RlLnRyeUdldENvbnRleHQoJ2VudicpXG5cdFx0Y29uc3QgY29udGV4dDogU3RhZ2VDb250ZXh0ID0gdGhpcy5ub2RlLnRyeUdldENvbnRleHQoZW52KVxuXG5cdFx0Ly8gMS4gT3JpZ2lu44Go44Gq44KLUzMgQnVja2V05L2c5oiQ44GZ44KL44CCXG5cdFx0Y29uc3QgYnVja2V0TmFtZTogc3RyaW5nID0gdGhpcy5ub2RlXG5cdFx0XHQudHJ5R2V0Q29udGV4dCgnczMnKVxuXHRcdFx0LmJ1Y2tldE5hbWUucmVwbGFjZSgnI0VOViMnLCBlbnYpXG5cdFx0Y29uc3Qgd2Vic2l0ZUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ1MzQnVja2V0Jywge1xuXHRcdFx0Ly8gczPjg5DjgrHjg4Pjg4jlkI3jgpLoqK3lrprjgZnjgovjgIJcblx0XHRcdGJ1Y2tldE5hbWU6IGJ1Y2tldE5hbWUsXG5cdFx0XHQvLyBCdWNrZXTjgbjjga7nm7TmjqXjgqLjgq/jgrvjgrnnpoHmraLjgZnjgovjgIJcblx0XHRcdGFjY2Vzc0NvbnRyb2w6IHMzLkJ1Y2tldEFjY2Vzc0NvbnRyb2wuUFJJVkFURSxcblx0XHRcdC8vIFNFUy0z5pqX5Y+35YyW44KS5pyJ5Yq544Gr44GX44G+44GZ44CCXG5cdFx0XHRlbmNyeXB0aW9uOiBzMy5CdWNrZXRFbmNyeXB0aW9uLlMzX01BTkFHRUQsXG5cdFx0XHQvLyDjg5Djg5bjg6rjg4Pjgq/jgqLjgq/jgrvjgrnjgpLjg5bjg63jg4Pjgq/jgZnjgovjgIJcblx0XHRcdGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG5cdFx0XHQvLyDjg5Djg7zjgrjjg6fjg4vjg7PjgrDjgpLmnInlirnjgavjgZnjgovjgIJcblx0XHRcdHZlcnNpb25lZDogdHJ1ZSxcblx0XHRcdC8vIENESyBTdGFja+WJiumZpOaZguOBq0J1Y2tldOOCguWJiumZpOOBmeOCi+OAglxuXHRcdFx0cmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuXHRcdFx0Ly8g6Z2Z55qE44Km44Kn44OW44K144Kk44OI44Ob44K544OG44Kj44Oz44Kw44KS6Kit5a6a44GZ44KL44CCXG5cdFx0XHR3ZWJzaXRlSW5kZXhEb2N1bWVudDogJ2luZGV4Lmh0bWwnLFxuXHRcdFx0d2Vic2l0ZUVycm9yRG9jdW1lbnQ6ICdpbmRleC5odG1sJyxcblx0XHR9KVxuXHRcdC8vIDIuIE9yaWdpbiBBY2Nlc3MgSWRlbnRpdHnkvZzmiJDjgZnjgovjgIJcblx0XHRjb25zdCB3ZWJzaXRlSWRlbnRpdHkgPSBuZXcgY2xvdWRmcm9udC5PcmlnaW5BY2Nlc3NJZGVudGl0eShcblx0XHRcdHRoaXMsXG5cdFx0XHQnV2Vic2l0ZUlkZW50aXR5Jyxcblx0XHRcdHtcblx0XHRcdFx0Y29tbWVudDogJ3dlYnNpdGUtaWRlbnRpdHknLFxuXHRcdFx0fSxcblx0XHQpXG5cdFx0Ly8gMy4gT3JpZ2luIEFjY2VzcyBJZGVudGl0eeOBi+OCieOBruOCouOCr+OCu+OCueOBruOBv+OCkuioseWPr+OBmeOCi0J1Y2tldCBQb2xpY3njgpLkvZzmiJDjgZnjgovjgIJcblx0XHRjb25zdCB3ZWJTaXRlQnVja2V0UG9saWN5U3RhdGVtZW50ID0gbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuXHRcdFx0ZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuXHRcdFx0YWN0aW9uczogWydzMzpHZXRPYmplY3QnXSxcblx0XHRcdHJlc291cmNlczogW2Ake3dlYnNpdGVCdWNrZXQuYnVja2V0QXJufS8qYF0sXG5cdFx0XHRwcmluY2lwYWxzOiBbXG5cdFx0XHRcdG5ldyBpYW0uQ2Fub25pY2FsVXNlclByaW5jaXBhbChcblx0XHRcdFx0XHR3ZWJzaXRlSWRlbnRpdHkuY2xvdWRGcm9udE9yaWdpbkFjY2Vzc0lkZW50aXR5UzNDYW5vbmljYWxVc2VySWQsXG5cdFx0XHRcdCksXG5cdFx0XHRdLFxuXHRcdH0pXG5cblx0XHQvLyA0LiBCdWNrZXQgUG9saWN544KSUzMgQnVja2V044Gr6YGp55So44GZ44KL44CCXG5cdFx0d2Vic2l0ZUJ1Y2tldC5hZGRUb1Jlc291cmNlUG9saWN5KHdlYlNpdGVCdWNrZXRQb2xpY3lTdGF0ZW1lbnQpXG5cblx0XHQvLyA1LiBMYW1iZGFARWRnZemWouaVsOOCkuS9nOaIkOOBmeOCi1xuXHRcdC8vIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9jZGsvYXBpL3YxL2RvY3MvYXdzLWNsb3VkZnJvbnQtcmVhZG1lLmh0bWwjbGFtYmRhZWRnZVxuXHRcdGNvbnN0IHdlYnNpdGVCYXNpY0F1dGhGdW5jdGlvbiA9IG5ldyBjbG91ZGZyb250LmV4cGVyaW1lbnRhbC5FZGdlRnVuY3Rpb24oXG5cdFx0XHR0aGlzLFxuXHRcdFx0J3dlYnNpdGVCYXNpY0F1dGhGdW5jdGlvbicsXG5cdFx0XHR7XG5cdFx0XHRcdGZ1bmN0aW9uTmFtZTogY29udGV4dC5uYW1lLFxuXHRcdFx0XHRkZXNjcmlwdGlvbjogYCR7Y29udGV4dC5kZXNjcmlwdGlvbn1gLFxuXHRcdFx0XHRoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG5cdFx0XHRcdHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xNF9YLFxuXHRcdFx0XHRjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXG5cdFx0XHRcdFx0am9pbihfX2Rpcm5hbWUsIGAuLi9zcmMvbGFtYmRhRWRnZS8ke2Vudn1gKSxcblx0XHRcdFx0KSxcblx0XHRcdH0sXG5cdFx0KVxuXG5cdFx0Ly8gNS4gQ2xvdWRGcm9udCBEaXN0cmlidXRpb27jgpLkvZzmiJBcblx0XHRjb25zdCB3ZWJzaXRlRGlzdHJpYnV0aW9uID0gbmV3IGNsb3VkZnJvbnQuQ2xvdWRGcm9udFdlYkRpc3RyaWJ1dGlvbihcblx0XHRcdHRoaXMsXG5cdFx0XHQnV2Vic2l0ZURpc3RyaWJ1dGlvbicsXG5cdFx0XHR7XG5cdFx0XHRcdGNvbW1lbnQ6ICd3ZWJzaXRlLWRpc3RyaWJ1dGlvbicsXG5cdFx0XHRcdGVycm9yQ29uZmlndXJhdGlvbnM6IFtcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRlcnJvckNhY2hpbmdNaW5UdGw6IDMwMCxcblx0XHRcdFx0XHRcdGVycm9yQ29kZTogNDAzLFxuXHRcdFx0XHRcdFx0cmVzcG9uc2VDb2RlOiAyMDAsXG5cdFx0XHRcdFx0XHRyZXNwb25zZVBhZ2VQYXRoOiAnL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZXJyb3JDYWNoaW5nTWluVHRsOiAzMDAsXG5cdFx0XHRcdFx0XHRlcnJvckNvZGU6IDQwNCxcblx0XHRcdFx0XHRcdHJlc3BvbnNlQ29kZTogMjAwLFxuXHRcdFx0XHRcdFx0cmVzcG9uc2VQYWdlUGF0aDogJy9pbmRleC5odG1sJyxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRdLFxuXHRcdFx0XHQvLyA2LiBEaXN0cmlidXRpb27jgatPcmlnaW7mg4XloLHvvIhTMyBCdWNrZXTjgIFPcmlnaW4gQWNjZXNzIElkZW50aXR577yJ44KS6Kit5a6aXG5cdFx0XHRcdG9yaWdpbkNvbmZpZ3M6IFtcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzM09yaWdpblNvdXJjZToge1xuXHRcdFx0XHRcdFx0XHRzM0J1Y2tldFNvdXJjZTogd2Vic2l0ZUJ1Y2tldCxcblx0XHRcdFx0XHRcdFx0b3JpZ2luQWNjZXNzSWRlbnRpdHk6IHdlYnNpdGVJZGVudGl0eSxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRiZWhhdmlvcnM6IFtcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGFsbG93ZWRNZXRob2RzOiBjbG91ZGZyb250LkNsb3VkRnJvbnRBbGxvd2VkTWV0aG9kcy5HRVRfSEVBRCxcblx0XHRcdFx0XHRcdFx0XHRjYWNoZWRNZXRob2RzOlxuXHRcdFx0XHRcdFx0XHRcdFx0Y2xvdWRmcm9udC5DbG91ZEZyb250QWxsb3dlZENhY2hlZE1ldGhvZHMuR0VUX0hFQUQsXG5cdFx0XHRcdFx0XHRcdFx0aXNEZWZhdWx0QmVoYXZpb3I6IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0dmlld2VyUHJvdG9jb2xQb2xpY3k6XG5cdFx0XHRcdFx0XHRcdFx0XHRjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuXHRcdFx0XHRcdFx0XHRcdC8vIOmWouaVsOOBrumWoumAo+S7mOOBkVxuXHRcdFx0XHRcdFx0XHRcdGxhbWJkYUZ1bmN0aW9uQXNzb2NpYXRpb25zOiBbXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGV2ZW50VHlwZTogY2xvdWRmcm9udC5MYW1iZGFFZGdlRXZlbnRUeXBlLlZJRVdFUl9SRVFVRVNULFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRsYW1iZGFGdW5jdGlvbjogd2Vic2l0ZUJhc2ljQXV0aEZ1bmN0aW9uLmN1cnJlbnRWZXJzaW9uLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpbmNsdWRlQm9keTogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdF0sXG5cdFx0XHRcdC8vIOaWmemHkeOCr+ODqeOCue+8muWMl+exs+OAgeasp+W3nuOAgeOCouOCuOOCouOAgeS4readseOAgeOCouODleODquOCq+OCkuS9v+eUqOOBmeOCi1xuXHRcdFx0XHRwcmljZUNsYXNzOiBjbG91ZGZyb250LlByaWNlQ2xhc3MuUFJJQ0VfQ0xBU1NfMjAwLFxuXHRcdFx0fSxcblx0XHQpXG5cblx0XHQvLyBTM+OBq+mdmeeahOODleOCoeOCpOODq+OCkuOCouODg+ODl+ODreODvOODieOBmeOCi+OAglxuXHRcdG5ldyBzM0RlcGxveW1lbnQuQnVja2V0RGVwbG95bWVudCh0aGlzLCAnV2Vic2l0ZURlcGxveScsIHtcblx0XHRcdHNvdXJjZXM6IFtzM0RlcGxveW1lbnQuU291cmNlLmFzc2V0KCcuL3NyYy93ZWIvYnVpbGQnKV0sXG5cdFx0XHRkZXN0aW5hdGlvbkJ1Y2tldDogd2Vic2l0ZUJ1Y2tldCxcblx0XHRcdGRpc3RyaWJ1dGlvbjogd2Vic2l0ZURpc3RyaWJ1dGlvbixcblx0XHRcdGRpc3RyaWJ1dGlvblBhdGhzOiBbJy8qJ10sXG5cdFx0fSlcblx0fVxufVxuIl19