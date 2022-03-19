"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkCloudFrontS3StaticWebSiteStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
class CdkCloudFrontS3StaticWebSiteStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // 1. OriginとなるS3 Bucket作成する。
        const bucketName = this.node.tryGetContext('s3').bucketName;
        const websiteBucket = new aws_cdk_lib_1.aws_s3.Bucket(this, 'S3Bucket', {
            // s3バケット名を設定する。
            bucketName: bucketName,
            // Bucketへの直接アクセス禁止する。
            accessControl: aws_cdk_lib_1.aws_s3.BucketAccessControl.PRIVATE,
            // S3バケットキーを介してKMS-SSE暗号化を有効にします。
            encryption: aws_cdk_lib_1.aws_s3.BucketEncryption.KMS,
            bucketKeyEnabled: true,
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
            comment: `website-identity`,
        });
        // 3. Origin Access Identityからのアクセスのみを許可するBucket Policyを作成する。
        const webSiteBucketPolicyStatement = new aws_cdk_lib_1.aws_iam.PolicyStatement({
            effect: aws_cdk_lib_1.aws_iam.Effect.ALLOW,
            actions: ['s3.GetObject'],
            resources: [`${websiteBucket.bucketArn}/*`],
            principals: [
                new aws_cdk_lib_1.aws_iam.CanonicalUserPrincipal(websiteIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId),
            ],
        });
        // 4. Bucket PolicyをS3 Bucketに適用する。
        websiteBucket.addToResourcePolicy(webSiteBucketPolicyStatement);
        // 5. CloudFront Distributionを作成
        const websiteDistribution = new aws_cdk_lib_1.aws_cloudfront.CloudFrontWebDistribution(this, 'WebsiteDistribution', {
            comment: `website-distribution`,
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
                        },
                    ],
                },
            ],
            // 料金クラス：北米、欧州、アジア、中東、アフリカを使用する
            priceClass: aws_cdk_lib_1.aws_cloudfront.PriceClass.PRICE_CLASS_200,
        });
        // S3に静的ファイルをアップロードする。
        new aws_cdk_lib_1.aws_s3_deployment.BucketDeployment(this, 'WebsiteDeploy', {
            sources: [aws_cdk_lib_1.aws_s3_deployment.Source.asset('./web/build')],
            destinationBucket: websiteBucket,
            distribution: websiteDistribution,
            distributionPaths: ['/*'],
        });
    }
}
exports.CdkCloudFrontS3StaticWebSiteStack = CdkCloudFrontS3StaticWebSiteStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLWNsb3VkLWZyb250LXMzLXN0YXRpYy13ZWJzaXRlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLWNsb3VkLWZyb250LXMzLXN0YXRpYy13ZWJzaXRlLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQVFvQjtBQUdwQixNQUFhLGlDQUFrQyxTQUFRLG1CQUFLO0lBQzNELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBa0I7UUFDM0QsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDdkIsNkJBQTZCO1FBQzdCLE1BQU0sVUFBVSxHQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQTtRQUNuRSxNQUFNLGFBQWEsR0FBRyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDckQsZ0JBQWdCO1lBQ2hCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLHNCQUFzQjtZQUN0QixhQUFhLEVBQUUsb0JBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPO1lBQzdDLGlDQUFpQztZQUNqQyxVQUFVLEVBQUUsb0JBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHO1lBQ25DLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsb0JBQW9CO1lBQ3BCLGlCQUFpQixFQUFFLG9CQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUztZQUNqRCxpQkFBaUI7WUFDakIsU0FBUyxFQUFFLElBQUk7WUFDZiw0QkFBNEI7WUFDNUIsYUFBYSxFQUFFLDJCQUFhLENBQUMsT0FBTztZQUNwQyx1QkFBdUI7WUFDdkIsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxvQkFBb0IsRUFBRSxZQUFZO1NBQ2xDLENBQUMsQ0FBQTtRQUNGLGlDQUFpQztRQUNqQyxNQUFNLGVBQWUsR0FBRyxJQUFJLDRCQUFVLENBQUMsb0JBQW9CLENBQzFELElBQUksRUFDSixpQkFBaUIsRUFDakI7WUFDQyxPQUFPLEVBQUUsa0JBQWtCO1NBQzNCLENBQ0QsQ0FBQTtRQUNELDZEQUE2RDtRQUM3RCxNQUFNLDRCQUE0QixHQUFHLElBQUkscUJBQUcsQ0FBQyxlQUFlLENBQUM7WUFDNUQsTUFBTSxFQUFFLHFCQUFHLENBQUMsTUFBTSxDQUFDLEtBQUs7WUFDeEIsT0FBTyxFQUFFLENBQUMsY0FBYyxDQUFDO1lBQ3pCLFNBQVMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLFNBQVMsSUFBSSxDQUFDO1lBQzNDLFVBQVUsRUFBRTtnQkFDWCxJQUFJLHFCQUFHLENBQUMsc0JBQXNCLENBQzdCLGVBQWUsQ0FBQywrQ0FBK0MsQ0FDL0Q7YUFDRDtTQUNELENBQUMsQ0FBQTtRQUVGLG1DQUFtQztRQUNuQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtRQUUvRCxnQ0FBZ0M7UUFDaEMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLDRCQUFVLENBQUMseUJBQXlCLENBQ25FLElBQUksRUFDSixxQkFBcUIsRUFDckI7WUFDQyxPQUFPLEVBQUUsc0JBQXNCO1lBQy9CLG1CQUFtQixFQUFFO2dCQUNwQjtvQkFDQyxrQkFBa0IsRUFBRSxHQUFHO29CQUN2QixTQUFTLEVBQUUsR0FBRztvQkFDZCxZQUFZLEVBQUUsR0FBRztvQkFDakIsZ0JBQWdCLEVBQUUsYUFBYTtpQkFDL0I7Z0JBQ0Q7b0JBQ0Msa0JBQWtCLEVBQUUsR0FBRztvQkFDdkIsU0FBUyxFQUFFLEdBQUc7b0JBQ2QsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLGdCQUFnQixFQUFFLGFBQWE7aUJBQy9CO2FBQ0Q7WUFDRCxnRUFBZ0U7WUFDaEUsYUFBYSxFQUFFO2dCQUNkO29CQUNDLGNBQWMsRUFBRTt3QkFDZixjQUFjLEVBQUUsYUFBYTt3QkFDN0Isb0JBQW9CLEVBQUUsZUFBZTtxQkFDckM7b0JBQ0QsU0FBUyxFQUFFO3dCQUNWOzRCQUNDLGNBQWMsRUFBRSw0QkFBVSxDQUFDLHdCQUF3QixDQUFDLFFBQVE7NEJBQzVELGFBQWEsRUFDWiw0QkFBVSxDQUFDLDhCQUE4QixDQUFDLFFBQVE7NEJBQ25ELGlCQUFpQixFQUFFLElBQUk7NEJBQ3ZCLG9CQUFvQixFQUNuQiw0QkFBVSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQjt5QkFDbEQ7cUJBQ0Q7aUJBQ0Q7YUFDRDtZQUNELCtCQUErQjtZQUMvQixVQUFVLEVBQUUsNEJBQVUsQ0FBQyxVQUFVLENBQUMsZUFBZTtTQUNqRCxDQUNELENBQUE7UUFFRCxzQkFBc0I7UUFDdEIsSUFBSSwrQkFBWSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDeEQsT0FBTyxFQUFFLENBQUMsK0JBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ25ELGlCQUFpQixFQUFFLGFBQWE7WUFDaEMsWUFBWSxFQUFFLG1CQUFtQjtZQUNqQyxpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQztTQUN6QixDQUFDLENBQUE7SUFDSCxDQUFDO0NBQ0Q7QUFsR0QsOEVBa0dDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0U3RhY2ssXG5cdFN0YWNrUHJvcHMsXG5cdGF3c19zMyBhcyBzMyxcblx0UmVtb3ZhbFBvbGljeSxcblx0YXdzX2lhbSBhcyBpYW0sXG5cdGF3c19jbG91ZGZyb250IGFzIGNsb3VkZnJvbnQsXG5cdGF3c19zM19kZXBsb3ltZW50IGFzIHMzRGVwbG95bWVudCxcbn0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJ1xuXG5leHBvcnQgY2xhc3MgQ2RrQ2xvdWRGcm9udFMzU3RhdGljV2ViU2l0ZVN0YWNrIGV4dGVuZHMgU3RhY2sge1xuXHRjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IFN0YWNrUHJvcHMpIHtcblx0XHRzdXBlcihzY29wZSwgaWQsIHByb3BzKVxuXHRcdC8vIDEuIE9yaWdpbuOBqOOBquOCi1MzIEJ1Y2tldOS9nOaIkOOBmeOCi+OAglxuXHRcdGNvbnN0IGJ1Y2tldE5hbWU6IHN0cmluZyA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCdzMycpLmJ1Y2tldE5hbWVcblx0XHRjb25zdCB3ZWJzaXRlQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnUzNCdWNrZXQnLCB7XG5cdFx0XHQvLyBzM+ODkOOCseODg+ODiOWQjeOCkuioreWumuOBmeOCi+OAglxuXHRcdFx0YnVja2V0TmFtZTogYnVja2V0TmFtZSxcblx0XHRcdC8vIEJ1Y2tldOOBuOOBruebtOaOpeOCouOCr+OCu+OCueemgeatouOBmeOCi+OAglxuXHRcdFx0YWNjZXNzQ29udHJvbDogczMuQnVja2V0QWNjZXNzQ29udHJvbC5QUklWQVRFLFxuXHRcdFx0Ly8gUzPjg5DjgrHjg4Pjg4jjgq3jg7zjgpLku4vjgZfjgaZLTVMtU1NF5pqX5Y+35YyW44KS5pyJ5Yq544Gr44GX44G+44GZ44CCXG5cdFx0XHRlbmNyeXB0aW9uOiBzMy5CdWNrZXRFbmNyeXB0aW9uLktNUyxcblx0XHRcdGJ1Y2tldEtleUVuYWJsZWQ6IHRydWUsXG5cdFx0XHQvLyDjg5Djg5bjg6rjg4Pjgq/jgqLjgq/jgrvjgrnjgpLjg5bjg63jg4Pjgq/jgZnjgovjgIJcblx0XHRcdGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG5cdFx0XHQvLyDjg5Djg7zjgrjjg6fjg4vjg7PjgrDjgpLmnInlirnjgavjgZnjgovjgIJcblx0XHRcdHZlcnNpb25lZDogdHJ1ZSxcblx0XHRcdC8vIENESyBTdGFja+WJiumZpOaZguOBq0J1Y2tldOOCguWJiumZpOOBmeOCi+OAglxuXHRcdFx0cmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuXHRcdFx0Ly8g6Z2Z55qE44Km44Kn44OW44K144Kk44OI44Ob44K544OG44Kj44Oz44Kw44KS6Kit5a6a44GZ44KL44CCXG5cdFx0XHR3ZWJzaXRlSW5kZXhEb2N1bWVudDogJ2luZGV4Lmh0bWwnLFxuXHRcdFx0d2Vic2l0ZUVycm9yRG9jdW1lbnQ6ICdpbmRleC5odG1sJyxcblx0XHR9KVxuXHRcdC8vIDIuIE9yaWdpbiBBY2Nlc3MgSWRlbnRpdHnkvZzmiJDjgZnjgovjgIJcblx0XHRjb25zdCB3ZWJzaXRlSWRlbnRpdHkgPSBuZXcgY2xvdWRmcm9udC5PcmlnaW5BY2Nlc3NJZGVudGl0eShcblx0XHRcdHRoaXMsXG5cdFx0XHQnV2Vic2l0ZUlkZW50aXR5Jyxcblx0XHRcdHtcblx0XHRcdFx0Y29tbWVudDogYHdlYnNpdGUtaWRlbnRpdHlgLFxuXHRcdFx0fSxcblx0XHQpXG5cdFx0Ly8gMy4gT3JpZ2luIEFjY2VzcyBJZGVudGl0eeOBi+OCieOBruOCouOCr+OCu+OCueOBruOBv+OCkuioseWPr+OBmeOCi0J1Y2tldCBQb2xpY3njgpLkvZzmiJDjgZnjgovjgIJcblx0XHRjb25zdCB3ZWJTaXRlQnVja2V0UG9saWN5U3RhdGVtZW50ID0gbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuXHRcdFx0ZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuXHRcdFx0YWN0aW9uczogWydzMy5HZXRPYmplY3QnXSxcblx0XHRcdHJlc291cmNlczogW2Ake3dlYnNpdGVCdWNrZXQuYnVja2V0QXJufS8qYF0sXG5cdFx0XHRwcmluY2lwYWxzOiBbXG5cdFx0XHRcdG5ldyBpYW0uQ2Fub25pY2FsVXNlclByaW5jaXBhbChcblx0XHRcdFx0XHR3ZWJzaXRlSWRlbnRpdHkuY2xvdWRGcm9udE9yaWdpbkFjY2Vzc0lkZW50aXR5UzNDYW5vbmljYWxVc2VySWQsXG5cdFx0XHRcdCksXG5cdFx0XHRdLFxuXHRcdH0pXG5cblx0XHQvLyA0LiBCdWNrZXQgUG9saWN544KSUzMgQnVja2V044Gr6YGp55So44GZ44KL44CCXG5cdFx0d2Vic2l0ZUJ1Y2tldC5hZGRUb1Jlc291cmNlUG9saWN5KHdlYlNpdGVCdWNrZXRQb2xpY3lTdGF0ZW1lbnQpXG5cblx0XHQvLyA1LiBDbG91ZEZyb250IERpc3RyaWJ1dGlvbuOCkuS9nOaIkFxuXHRcdGNvbnN0IHdlYnNpdGVEaXN0cmlidXRpb24gPSBuZXcgY2xvdWRmcm9udC5DbG91ZEZyb250V2ViRGlzdHJpYnV0aW9uKFxuXHRcdFx0dGhpcyxcblx0XHRcdCdXZWJzaXRlRGlzdHJpYnV0aW9uJyxcblx0XHRcdHtcblx0XHRcdFx0Y29tbWVudDogYHdlYnNpdGUtZGlzdHJpYnV0aW9uYCxcblx0XHRcdFx0ZXJyb3JDb25maWd1cmF0aW9uczogW1xuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGVycm9yQ2FjaGluZ01pblR0bDogMzAwLFxuXHRcdFx0XHRcdFx0ZXJyb3JDb2RlOiA0MDMsXG5cdFx0XHRcdFx0XHRyZXNwb25zZUNvZGU6IDIwMCxcblx0XHRcdFx0XHRcdHJlc3BvbnNlUGFnZVBhdGg6ICcvaW5kZXguaHRtbCcsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRlcnJvckNhY2hpbmdNaW5UdGw6IDMwMCxcblx0XHRcdFx0XHRcdGVycm9yQ29kZTogNDA0LFxuXHRcdFx0XHRcdFx0cmVzcG9uc2VDb2RlOiAyMDAsXG5cdFx0XHRcdFx0XHRyZXNwb25zZVBhZ2VQYXRoOiAnL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdF0sXG5cdFx0XHRcdC8vIDYuIERpc3RyaWJ1dGlvbuOBq09yaWdpbuaDheWgse+8iFMzIEJ1Y2tldOOAgU9yaWdpbiBBY2Nlc3MgSWRlbnRpdHnvvInjgpLoqK3lrppcblx0XHRcdFx0b3JpZ2luQ29uZmlnczogW1xuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHMzT3JpZ2luU291cmNlOiB7XG5cdFx0XHRcdFx0XHRcdHMzQnVja2V0U291cmNlOiB3ZWJzaXRlQnVja2V0LFxuXHRcdFx0XHRcdFx0XHRvcmlnaW5BY2Nlc3NJZGVudGl0eTogd2Vic2l0ZUlkZW50aXR5LFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGJlaGF2aW9yczogW1xuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0YWxsb3dlZE1ldGhvZHM6IGNsb3VkZnJvbnQuQ2xvdWRGcm9udEFsbG93ZWRNZXRob2RzLkdFVF9IRUFELFxuXHRcdFx0XHRcdFx0XHRcdGNhY2hlZE1ldGhvZHM6XG5cdFx0XHRcdFx0XHRcdFx0XHRjbG91ZGZyb250LkNsb3VkRnJvbnRBbGxvd2VkQ2FjaGVkTWV0aG9kcy5HRVRfSEVBRCxcblx0XHRcdFx0XHRcdFx0XHRpc0RlZmF1bHRCZWhhdmlvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHR2aWV3ZXJQcm90b2NvbFBvbGljeTpcblx0XHRcdFx0XHRcdFx0XHRcdGNsb3VkZnJvbnQuVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdF0sXG5cdFx0XHRcdC8vIOaWmemHkeOCr+ODqeOCue+8muWMl+exs+OAgeasp+W3nuOAgeOCouOCuOOCouOAgeS4readseOAgeOCouODleODquOCq+OCkuS9v+eUqOOBmeOCi1xuXHRcdFx0XHRwcmljZUNsYXNzOiBjbG91ZGZyb250LlByaWNlQ2xhc3MuUFJJQ0VfQ0xBU1NfMjAwLFxuXHRcdFx0fSxcblx0XHQpXG5cblx0XHQvLyBTM+OBq+mdmeeahOODleOCoeOCpOODq+OCkuOCouODg+ODl+ODreODvOODieOBmeOCi+OAglxuXHRcdG5ldyBzM0RlcGxveW1lbnQuQnVja2V0RGVwbG95bWVudCh0aGlzLCAnV2Vic2l0ZURlcGxveScsIHtcblx0XHRcdHNvdXJjZXM6IFtzM0RlcGxveW1lbnQuU291cmNlLmFzc2V0KCcuL3dlYi9idWlsZCcpXSxcblx0XHRcdGRlc3RpbmF0aW9uQnVja2V0OiB3ZWJzaXRlQnVja2V0LFxuXHRcdFx0ZGlzdHJpYnV0aW9uOiB3ZWJzaXRlRGlzdHJpYnV0aW9uLFxuXHRcdFx0ZGlzdHJpYnV0aW9uUGF0aHM6IFsnLyonXSxcblx0XHR9KVxuXHR9XG59XG4iXX0=