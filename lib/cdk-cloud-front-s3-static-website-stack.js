"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkCloudFrontS3StaticWebSiteStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
class CdkCloudFrontS3StaticWebSiteStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // 0. Lambda@EdgeのARN:Versionをインポートする。
        const env = this.node.tryGetContext('env');
        const context = this.node.tryGetContext(env);
        const websiteBasicAuthFunctionVersion = aws_cdk_lib_1.Fn.importValue('websiteBasicAuthFunctionVersion');
        const edgeViewerRequest = aws_lambda_1.Version.fromVersionArn(this, 'EdgeViewerRequest', `${websiteBasicAuthFunctionVersion}:${context.edgeVersion}`);
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
                                    lambdaFunction: edgeViewerRequest,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLWNsb3VkLWZyb250LXMzLXN0YXRpYy13ZWJzaXRlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLWNsb3VkLWZyb250LXMzLXN0YXRpYy13ZWJzaXRlLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQVNvQjtBQUNwQix1REFBZ0Q7QUFJaEQsTUFBYSxpQ0FBa0MsU0FBUSxtQkFBSztJQUMzRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1FBQzNELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBRXZCLHNDQUFzQztRQUN0QyxNQUFNLEdBQUcsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNsRCxNQUFNLE9BQU8sR0FBaUIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDMUQsTUFBTSwrQkFBK0IsR0FBRyxnQkFBRSxDQUFDLFdBQVcsQ0FDckQsaUNBQWlDLENBQ2pDLENBQUE7UUFDRCxNQUFNLGlCQUFpQixHQUFHLG9CQUFPLENBQUMsY0FBYyxDQUMvQyxJQUFJLEVBQ0osbUJBQW1CLEVBQ25CLEdBQUcsK0JBQStCLElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUMzRCxDQUFBO1FBRUQsNkJBQTZCO1FBQzdCLE1BQU0sVUFBVSxHQUFXLElBQUksQ0FBQyxJQUFJO2FBQ2xDLGFBQWEsQ0FBQyxJQUFJLENBQUM7YUFDbkIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDbEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxvQkFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQ3JELGdCQUFnQjtZQUNoQixVQUFVLEVBQUUsVUFBVTtZQUN0QixzQkFBc0I7WUFDdEIsYUFBYSxFQUFFLG9CQUFFLENBQUMsbUJB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LENBQUMsSUFBSSxDQUFDO1NBQ3pCLENBQUMsQ0FBQTtJQUNILENBQUM7Q0FDRDtBQXhIRCw4RUF3SEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuXHRTdGFjayxcblx0U3RhY2tQcm9wcyxcblx0YXdzX3MzIGFzIHMzLFxuXHRSZW1vdmFsUG9saWN5LFxuXHRhd3NfaWFtIGFzIGlhbSxcblx0YXdzX2Nsb3VkZnJvbnQgYXMgY2xvdWRmcm9udCxcblx0YXdzX3MzX2RlcGxveW1lbnQgYXMgczNEZXBsb3ltZW50LFxuXHRGbixcbn0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBWZXJzaW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSdcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnXG5pbXBvcnQgeyBTdGFnZUNvbnRleHQgfSBmcm9tICcuL2ludGVyZmFjZSdcblxuZXhwb3J0IGNsYXNzIENka0Nsb3VkRnJvbnRTM1N0YXRpY1dlYlNpdGVTdGFjayBleHRlbmRzIFN0YWNrIHtcblx0Y29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XG5cdFx0c3VwZXIoc2NvcGUsIGlkLCBwcm9wcylcblxuXHRcdC8vIDAuIExhbWJkYUBFZGdl44GuQVJOOlZlcnNpb27jgpLjgqTjg7Pjg53jg7zjg4jjgZnjgovjgIJcblx0XHRjb25zdCBlbnY6IHN0cmluZyA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCdlbnYnKVxuXHRcdGNvbnN0IGNvbnRleHQ6IFN0YWdlQ29udGV4dCA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KGVudilcblx0XHRjb25zdCB3ZWJzaXRlQmFzaWNBdXRoRnVuY3Rpb25WZXJzaW9uID0gRm4uaW1wb3J0VmFsdWUoXG5cdFx0XHQnd2Vic2l0ZUJhc2ljQXV0aEZ1bmN0aW9uVmVyc2lvbicsXG5cdFx0KVxuXHRcdGNvbnN0IGVkZ2VWaWV3ZXJSZXF1ZXN0ID0gVmVyc2lvbi5mcm9tVmVyc2lvbkFybihcblx0XHRcdHRoaXMsXG5cdFx0XHQnRWRnZVZpZXdlclJlcXVlc3QnLFxuXHRcdFx0YCR7d2Vic2l0ZUJhc2ljQXV0aEZ1bmN0aW9uVmVyc2lvbn06JHtjb250ZXh0LmVkZ2VWZXJzaW9ufWAsXG5cdFx0KVxuXG5cdFx0Ly8gMS4gT3JpZ2lu44Go44Gq44KLUzMgQnVja2V05L2c5oiQ44GZ44KL44CCXG5cdFx0Y29uc3QgYnVja2V0TmFtZTogc3RyaW5nID0gdGhpcy5ub2RlXG5cdFx0XHQudHJ5R2V0Q29udGV4dCgnczMnKVxuXHRcdFx0LmJ1Y2tldE5hbWUucmVwbGFjZSgnI0VOViMnLCBlbnYpXG5cdFx0Y29uc3Qgd2Vic2l0ZUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ1MzQnVja2V0Jywge1xuXHRcdFx0Ly8gczPjg5DjgrHjg4Pjg4jlkI3jgpLoqK3lrprjgZnjgovjgIJcblx0XHRcdGJ1Y2tldE5hbWU6IGJ1Y2tldE5hbWUsXG5cdFx0XHQvLyBCdWNrZXTjgbjjga7nm7TmjqXjgqLjgq/jgrvjgrnnpoHmraLjgZnjgovjgIJcblx0XHRcdGFjY2Vzc0NvbnRyb2w6IHMzLkJ1Y2tldEFjY2Vzc0NvbnRyb2wuUFJJVkFURSxcblx0XHRcdC8vIFNFUy0z5pqX5Y+35YyW44KS5pyJ5Yq544Gr44GX44G+44GZ44CCXG5cdFx0XHRlbmNyeXB0aW9uOiBzMy5CdWNrZXRFbmNyeXB0aW9uLlMzX01BTkFHRUQsXG5cdFx0XHQvLyDjg5Djg5bjg6rjg4Pjgq/jgqLjgq/jgrvjgrnjgpLjg5bjg63jg4Pjgq/jgZnjgovjgIJcblx0XHRcdGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG5cdFx0XHQvLyDjg5Djg7zjgrjjg6fjg4vjg7PjgrDjgpLmnInlirnjgavjgZnjgovjgIJcblx0XHRcdHZlcnNpb25lZDogdHJ1ZSxcblx0XHRcdC8vIENESyBTdGFja+WJiumZpOaZguOBq0J1Y2tldOOCguWJiumZpOOBmeOCi+OAglxuXHRcdFx0cmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuXHRcdFx0Ly8g6Z2Z55qE44Km44Kn44OW44K144Kk44OI44Ob44K544OG44Kj44Oz44Kw44KS6Kit5a6a44GZ44KL44CCXG5cdFx0XHR3ZWJzaXRlSW5kZXhEb2N1bWVudDogJ2luZGV4Lmh0bWwnLFxuXHRcdFx0d2Vic2l0ZUVycm9yRG9jdW1lbnQ6ICdpbmRleC5odG1sJyxcblx0XHR9KVxuXHRcdC8vIDIuIE9yaWdpbiBBY2Nlc3MgSWRlbnRpdHnkvZzmiJDjgZnjgovjgIJcblx0XHRjb25zdCB3ZWJzaXRlSWRlbnRpdHkgPSBuZXcgY2xvdWRmcm9udC5PcmlnaW5BY2Nlc3NJZGVudGl0eShcblx0XHRcdHRoaXMsXG5cdFx0XHQnV2Vic2l0ZUlkZW50aXR5Jyxcblx0XHRcdHtcblx0XHRcdFx0Y29tbWVudDogJ3dlYnNpdGUtaWRlbnRpdHknLFxuXHRcdFx0fSxcblx0XHQpXG5cdFx0Ly8gMy4gT3JpZ2luIEFjY2VzcyBJZGVudGl0eeOBi+OCieOBruOCouOCr+OCu+OCueOBruOBv+OCkuioseWPr+OBmeOCi0J1Y2tldCBQb2xpY3njgpLkvZzmiJDjgZnjgovjgIJcblx0XHRjb25zdCB3ZWJTaXRlQnVja2V0UG9saWN5U3RhdGVtZW50ID0gbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuXHRcdFx0ZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuXHRcdFx0YWN0aW9uczogWydzMzpHZXRPYmplY3QnXSxcblx0XHRcdHJlc291cmNlczogW2Ake3dlYnNpdGVCdWNrZXQuYnVja2V0QXJufS8qYF0sXG5cdFx0XHRwcmluY2lwYWxzOiBbXG5cdFx0XHRcdG5ldyBpYW0uQ2Fub25pY2FsVXNlclByaW5jaXBhbChcblx0XHRcdFx0XHR3ZWJzaXRlSWRlbnRpdHkuY2xvdWRGcm9udE9yaWdpbkFjY2Vzc0lkZW50aXR5UzNDYW5vbmljYWxVc2VySWQsXG5cdFx0XHRcdCksXG5cdFx0XHRdLFxuXHRcdH0pXG5cblx0XHQvLyA0LiBCdWNrZXQgUG9saWN544KSUzMgQnVja2V044Gr6YGp55So44GZ44KL44CCXG5cdFx0d2Vic2l0ZUJ1Y2tldC5hZGRUb1Jlc291cmNlUG9saWN5KHdlYlNpdGVCdWNrZXRQb2xpY3lTdGF0ZW1lbnQpXG5cblx0XHQvLyA1LiBDbG91ZEZyb250IERpc3RyaWJ1dGlvbuOCkuS9nOaIkFxuXHRcdGNvbnN0IHdlYnNpdGVEaXN0cmlidXRpb24gPSBuZXcgY2xvdWRmcm9udC5DbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uKFxuXHRcdFx0dGhpcyxcblx0XHRcdCdXZWJzaXRlRGlzdHJpYnV0aW9uJyxcblx0XHRcdHtcblx0XHRcdFx0Y29tbWVudDogJ3dlYnNpdGUtZGlzdHJpYnV0aW9uJyxcblx0XHRcdFx0ZXJyb3JDb25maWd1cmF0aW9uczogW1xuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGVycm9yQ2FjaGluZ01pblR0bDogMzAwLFxuXHRcdFx0XHRcdFx0ZXJyb3JDb2RlOiA0MDMsXG5cdFx0XHRcdFx0XHRyZXNwb25zZUNvZGU6IDIwMCxcblx0XHRcdFx0XHRcdHJlc3BvbnNlUGFnZVBhdGg6ICcvaW5kZXguaHRtbCcsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRlcnJvckNhY2hpbmdNaW5UdGw6IDMwMCxcblx0XHRcdFx0XHRcdGVycm9yQ29kZTogNDA0LFxuXHRcdFx0XHRcdFx0cmVzcG9uc2VDb2RlOiAyMDAsXG5cdFx0XHRcdFx0XHRyZXNwb25zZVBhZ2VQYXRoOiAnL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdF0sXG5cdFx0XHRcdC8vIDYuIERpc3RyaWJ1dGlvbuOBq09yaWdpbuaDheWgse+8iFMzIEJ1Y2tldOOAgU9yaWdpbiBBY2Nlc3MgSWRlbnRpdHnvvInjgpLoqK3lrppcblx0XHRcdFx0b3JpZ2luQ29uZmlnczogW1xuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHMzT3JpZ2luU291cmNlOiB7XG5cdFx0XHRcdFx0XHRcdHMzQnVja2V0U291cmNlOiB3ZWJzaXRlQnVja2V0LFxuXHRcdFx0XHRcdFx0XHRvcmlnaW5BY2Nlc3NJZGVudGl0eTogd2Vic2l0ZUlkZW50aXR5LFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGJlaGF2aW9yczogW1xuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YWxsb3dlZE1ldGhvZHM6IGNsb3VkZnJvbnQuQ2xvdWRGcm9udEFsbG93ZWRNZXRob2RzLkdFVF9IRUFELFxuXHRcdFx0XHRcdFx0XHRcdGNhY2hlZE1ldGhvZHM6XG5cdFx0XHRcdFx0XHRcdFx0XHRjbG91ZGZyb250LkNsb3VkRnJvbnRBbGxvd2VkQ2FjaGVkTWV0aG9kcy5HRVRfSEVBRCxcblx0XHRcdFx0XHRcdFx0XHRpc0RlZmF1bHRCZWhhdmlvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHR2aWV3ZXJQcm90b2NvbFBvbGljeTpcblx0XHRcdFx0XHRcdFx0XHRcdGNsb3VkZnJvbnQuVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG5cdFx0XHRcdFx0XHRcdFx0Ly8g6Zai5pWw44Gu6Zai6YCj5LuY44GRXG5cdFx0XHRcdFx0XHRcdFx0bGFtYmRhRnVuY3Rpb25Bc3NvY2lhdGlvbnM6IFtcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZXZlbnRUeXBlOiBjbG91ZGZyb250LkxhbWJkYUVkZ2VFdmVudFR5cGUuVklFV0VSX1JFUVVFU1QsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxhbWJkYUZ1bmN0aW9uOiBlZGdlVmlld2VyUmVxdWVzdCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0aW5jbHVkZUJvZHk6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRdLFxuXHRcdFx0XHQvLyDmlpnph5Hjgq/jg6njgrnvvJrljJfnsbPjgIHmrKflt57jgIHjgqLjgrjjgqLjgIHkuK3mnbHjgIHjgqLjg5Xjg6rjgqvjgpLkvb/nlKjjgZnjgotcblx0XHRcdFx0cHJpY2VDbGFzczogY2xvdWRmcm9udC5QcmljZUNsYXNzLlBSSUNFX0NMQVNTXzIwMCxcblx0XHRcdH0sXG5cdFx0KVxuXG5cdFx0Ly8gUzPjgavpnZnnmoTjg5XjgqHjgqTjg6vjgpLjgqLjg4Pjg5fjg63jg7zjg4njgZnjgovjgIJcblx0XHRuZXcgczNEZXBsb3ltZW50LkJ1Y2tldERlcGxveW1lbnQodGhpcywgJ1dlYnNpdGVEZXBsb3knLCB7XG5cdFx0XHRzb3VyY2VzOiBbczNEZXBsb3ltZW50LlNvdXJjZS5hc3NldCgnLi9zcmMvd2ViL2J1aWxkJyldLFxuXHRcdFx0ZGVzdGluYXRpb25CdWNrZXQ6IHdlYnNpdGVCdWNrZXQsXG5cdFx0XHRkaXN0cmlidXRpb246IHdlYnNpdGVEaXN0cmlidXRpb24sXG5cdFx0XHRkaXN0cmlidXRpb25QYXRoczogWycvKiddLFxuXHRcdH0pXG5cdH1cbn1cbiJdfQ==