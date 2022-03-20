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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLWNsb3VkLWZyb250LXMzLXN0YXRpYy13ZWJzaXRlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLWNsb3VkLWZyb250LXMzLXN0YXRpYy13ZWJzaXRlLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQVVvQjtBQUNwQiwrQkFBMkI7QUFJM0IsTUFBYSxpQ0FBa0MsU0FBUSxtQkFBSztJQUMzRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1FBQzNELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ3ZCLE1BQU0sR0FBRyxHQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2xELE1BQU0sT0FBTyxHQUFpQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUUxRCw2QkFBNkI7UUFDN0IsTUFBTSxVQUFVLEdBQVcsSUFBSSxDQUFDLElBQUk7YUFDbEMsYUFBYSxDQUFDLElBQUksQ0FBQzthQUNuQixVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNsQyxNQUFNLGFBQWEsR0FBRyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDckQsZ0JBQWdCO1lBQ2hCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLHNCQUFzQjtZQUN0QixhQUFhLEVBQUUsb0JBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPO1lBQzdDLG1CQUFtQjtZQUNuQixVQUFVLEVBQUUsb0JBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVO1lBQzFDLG9CQUFvQjtZQUNwQixpQkFBaUIsRUFBRSxvQkFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVM7WUFDakQsaUJBQWlCO1lBQ2pCLFNBQVMsRUFBRSxJQUFJO1lBQ2YsNEJBQTRCO1lBQzVCLGFBQWEsRUFBRSwyQkFBYSxDQUFDLE9BQU87WUFDcEMsdUJBQXVCO1lBQ3ZCLG9CQUFvQixFQUFFLFlBQVk7WUFDbEMsb0JBQW9CLEVBQUUsWUFBWTtTQUNsQyxDQUFDLENBQUE7UUFDRixpQ0FBaUM7UUFDakMsTUFBTSxlQUFlLEdBQUcsSUFBSSw0QkFBVSxDQUFDLG9CQUFvQixDQUMxRCxJQUFJLEVBQ0osaUJBQWlCLEVBQ2pCO1lBQ0MsT0FBTyxFQUFFLGtCQUFrQjtTQUMzQixDQUNELENBQUE7UUFDRCw2REFBNkQ7UUFDN0QsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLHFCQUFHLENBQUMsZUFBZSxDQUFDO1lBQzVELE1BQU0sRUFBRSxxQkFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLO1lBQ3hCLE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQztZQUN6QixTQUFTLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxTQUFTLElBQUksQ0FBQztZQUMzQyxVQUFVLEVBQUU7Z0JBQ1gsSUFBSSxxQkFBRyxDQUFDLHNCQUFzQixDQUM3QixlQUFlLENBQUMsK0NBQStDLENBQy9EO2FBQ0Q7U0FDRCxDQUFDLENBQUE7UUFFRixtQ0FBbUM7UUFDbkMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLDRCQUE0QixDQUFDLENBQUE7UUFFL0Qsd0JBQXdCO1FBQ3hCLG9GQUFvRjtRQUNwRixNQUFNLHdCQUF3QixHQUFHLElBQUksNEJBQVUsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUN4RSxJQUFJLEVBQ0osMEJBQTBCLEVBQzFCO1lBQ0MsWUFBWSxFQUFFLE9BQU8sQ0FBQyxJQUFJO1lBQzFCLFdBQVcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUU7WUFDckMsT0FBTyxFQUFFLGVBQWU7WUFDeEIsT0FBTyxFQUFFLHdCQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsSUFBSSxFQUFFLHdCQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FDMUIsV0FBSSxDQUFDLFNBQVMsRUFBRSxxQkFBcUIsR0FBRyxFQUFFLENBQUMsQ0FDM0M7U0FDRCxDQUNELENBQUE7UUFFRCxnQ0FBZ0M7UUFDaEMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLDRCQUFVLENBQUMseUJBQXlCLENBQ25FLElBQUksRUFDSixxQkFBcUIsRUFDckI7WUFDQyxPQUFPLEVBQUUsc0JBQXNCO1lBQy9CLG1CQUFtQixFQUFFO2dCQUNwQjtvQkFDQyxrQkFBa0IsRUFBRSxHQUFHO29CQUN2QixTQUFTLEVBQUUsR0FBRztvQkFDZCxZQUFZLEVBQUUsR0FBRztvQkFDakIsZ0JBQWdCLEVBQUUsYUFBYTtpQkFDL0I7Z0JBQ0Q7b0JBQ0Msa0JBQWtCLEVBQUUsR0FBRztvQkFDdkIsU0FBUyxFQUFFLEdBQUc7b0JBQ2QsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLGdCQUFnQixFQUFFLGFBQWE7aUJBQy9CO2FBQ0Q7WUFDRCxnRUFBZ0U7WUFDaEUsYUFBYSxFQUFFO2dCQUNkO29CQUNDLGNBQWMsRUFBRTt3QkFDZixjQUFjLEVBQUUsYUFBYTt3QkFDN0Isb0JBQW9CLEVBQUUsZUFBZTtxQkFDckM7b0JBQ0QsU0FBUyxFQUFFO3dCQUNWOzRCQUNDLGNBQWMsRUFBRSw0QkFBVSxDQUFDLHdCQUF3QixDQUFDLFFBQVE7NEJBQzVELGFBQWEsRUFDWiw0QkFBVSxDQUFDLDhCQUE4QixDQUFDLFFBQVE7NEJBQ25ELGlCQUFpQixFQUFFLElBQUk7NEJBQ3ZCLG9CQUFvQixFQUNuQiw0QkFBVSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQjs0QkFDbEQsVUFBVTs0QkFDViwwQkFBMEIsRUFBRTtnQ0FDM0I7b0NBQ0MsU0FBUyxFQUFFLDRCQUFVLENBQUMsbUJBQW1CLENBQUMsY0FBYztvQ0FDeEQsY0FBYyxFQUFFLHdCQUF3QixDQUFDLGNBQWM7b0NBQ3ZELFdBQVcsRUFBRSxLQUFLO2lDQUNsQjs2QkFDRDt5QkFDRDtxQkFDRDtpQkFDRDthQUNEO1lBQ0QsK0JBQStCO1lBQy9CLFVBQVUsRUFBRSw0QkFBVSxDQUFDLFVBQVUsQ0FBQyxlQUFlO1NBQ2pELENBQ0QsQ0FBQTtRQUVELHNCQUFzQjtRQUN0QixJQUFJLCtCQUFZLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUN4RCxPQUFPLEVBQUUsQ0FBQywrQkFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN2RCxpQkFBaUIsRUFBRSxhQUFhO1lBQ2hDLFlBQVksRUFBRSxtQkFBbUI7WUFDakMsaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUM7U0FDekIsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUNEO0FBOUhELDhFQThIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdFN0YWNrLFxuXHRTdGFja1Byb3BzLFxuXHRhd3NfczMgYXMgczMsXG5cdFJlbW92YWxQb2xpY3ksXG5cdGF3c19pYW0gYXMgaWFtLFxuXHRhd3NfY2xvdWRmcm9udCBhcyBjbG91ZGZyb250LFxuXHRhd3NfczNfZGVwbG95bWVudCBhcyBzM0RlcGxveW1lbnQsXG5cdGF3c19sYW1iZGEgYXMgbGFtYmRhLFxuXHREdXJhdGlvbixcbn0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCdcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnXG5pbXBvcnQgeyBTdGFnZUNvbnRleHQgfSBmcm9tICcuL2ludGVyZmFjZSdcblxuZXhwb3J0IGNsYXNzIENka0Nsb3VkRnJvbnRTM1N0YXRpY1dlYlNpdGVTdGFjayBleHRlbmRzIFN0YWNrIHtcblx0Y29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XG5cdFx0c3VwZXIoc2NvcGUsIGlkLCBwcm9wcylcblx0XHRjb25zdCBlbnY6IHN0cmluZyA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCdlbnYnKVxuXHRcdGNvbnN0IGNvbnRleHQ6IFN0YWdlQ29udGV4dCA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KGVudilcblxuXHRcdC8vIDEuIE9yaWdpbuOBqOOBquOCi1MzIEJ1Y2tldOS9nOaIkOOBmeOCi+OAglxuXHRcdGNvbnN0IGJ1Y2tldE5hbWU6IHN0cmluZyA9IHRoaXMubm9kZVxuXHRcdFx0LnRyeUdldENvbnRleHQoJ3MzJylcblx0XHRcdC5idWNrZXROYW1lLnJlcGxhY2UoJyNFTlYjJywgZW52KVxuXHRcdGNvbnN0IHdlYnNpdGVCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdTM0J1Y2tldCcsIHtcblx0XHRcdC8vIHMz44OQ44Kx44OD44OI5ZCN44KS6Kit5a6a44GZ44KL44CCXG5cdFx0XHRidWNrZXROYW1lOiBidWNrZXROYW1lLFxuXHRcdFx0Ly8gQnVja2V044G444Gu55u05o6l44Ki44Kv44K744K556aB5q2i44GZ44KL44CCXG5cdFx0XHRhY2Nlc3NDb250cm9sOiBzMy5CdWNrZXRBY2Nlc3NDb250cm9sLlBSSVZBVEUsXG5cdFx0XHQvLyBTRVMtM+aal+WPt+WMluOCkuacieWKueOBq+OBl+OBvuOBmeOAglxuXHRcdFx0ZW5jcnlwdGlvbjogczMuQnVja2V0RW5jcnlwdGlvbi5TM19NQU5BR0VELFxuXHRcdFx0Ly8g44OQ44OW44Oq44OD44Kv44Ki44Kv44K744K544KS44OW44Ot44OD44Kv44GZ44KL44CCXG5cdFx0XHRibG9ja1B1YmxpY0FjY2VzczogczMuQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMLFxuXHRcdFx0Ly8g44OQ44O844K444On44OL44Oz44Kw44KS5pyJ5Yq544Gr44GZ44KL44CCXG5cdFx0XHR2ZXJzaW9uZWQ6IHRydWUsXG5cdFx0XHQvLyBDREsgU3RhY2vliYrpmaTmmYLjgatCdWNrZXTjgoLliYrpmaTjgZnjgovjgIJcblx0XHRcdHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcblx0XHRcdC8vIOmdmeeahOOCpuOCp+ODluOCteOCpOODiOODm+OCueODhuOCo+ODs+OCsOOCkuioreWumuOBmeOCi+OAglxuXHRcdFx0d2Vic2l0ZUluZGV4RG9jdW1lbnQ6ICdpbmRleC5odG1sJyxcblx0XHRcdHdlYnNpdGVFcnJvckRvY3VtZW50OiAnaW5kZXguaHRtbCcsXG5cdFx0fSlcblx0XHQvLyAyLiBPcmlnaW4gQWNjZXNzIElkZW50aXR55L2c5oiQ44GZ44KL44CCXG5cdFx0Y29uc3Qgd2Vic2l0ZUlkZW50aXR5ID0gbmV3IGNsb3VkZnJvbnQuT3JpZ2luQWNjZXNzSWRlbnRpdHkoXG5cdFx0XHR0aGlzLFxuXHRcdFx0J1dlYnNpdGVJZGVudGl0eScsXG5cdFx0XHR7XG5cdFx0XHRcdGNvbW1lbnQ6ICd3ZWJzaXRlLWlkZW50aXR5Jyxcblx0XHRcdH0sXG5cdFx0KVxuXHRcdC8vIDMuIE9yaWdpbiBBY2Nlc3MgSWRlbnRpdHnjgYvjgonjga7jgqLjgq/jgrvjgrnjga7jgb/jgpLoqLHlj6/jgZnjgotCdWNrZXQgUG9saWN544KS5L2c5oiQ44GZ44KL44CCXG5cdFx0Y29uc3Qgd2ViU2l0ZUJ1Y2tldFBvbGljeVN0YXRlbWVudCA9IG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcblx0XHRcdGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcblx0XHRcdGFjdGlvbnM6IFsnczM6R2V0T2JqZWN0J10sXG5cdFx0XHRyZXNvdXJjZXM6IFtgJHt3ZWJzaXRlQnVja2V0LmJ1Y2tldEFybn0vKmBdLFxuXHRcdFx0cHJpbmNpcGFsczogW1xuXHRcdFx0XHRuZXcgaWFtLkNhbm9uaWNhbFVzZXJQcmluY2lwYWwoXG5cdFx0XHRcdFx0d2Vic2l0ZUlkZW50aXR5LmNsb3VkRnJvbnRPcmlnaW5BY2Nlc3NJZGVudGl0eVMzQ2Fub25pY2FsVXNlcklkLFxuXHRcdFx0XHQpLFxuXHRcdFx0XSxcblx0XHR9KVxuXG5cdFx0Ly8gNC4gQnVja2V0IFBvbGljeeOCklMzIEJ1Y2tldOOBq+mBqeeUqOOBmeOCi+OAglxuXHRcdHdlYnNpdGVCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeSh3ZWJTaXRlQnVja2V0UG9saWN5U3RhdGVtZW50KVxuXG5cdFx0Ly8gNS4gTGFtYmRhQEVkZ2XplqLmlbDjgpLkvZzmiJDjgZnjgotcblx0XHQvLyBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vY2RrL2FwaS92MS9kb2NzL2F3cy1jbG91ZGZyb250LXJlYWRtZS5odG1sI2xhbWJkYWVkZ2Vcblx0XHRjb25zdCB3ZWJzaXRlQmFzaWNBdXRoRnVuY3Rpb24gPSBuZXcgY2xvdWRmcm9udC5leHBlcmltZW50YWwuRWRnZUZ1bmN0aW9uKFxuXHRcdFx0dGhpcyxcblx0XHRcdCd3ZWJzaXRlQmFzaWNBdXRoRnVuY3Rpb24nLFxuXHRcdFx0e1xuXHRcdFx0XHRmdW5jdGlvbk5hbWU6IGNvbnRleHQubmFtZSxcblx0XHRcdFx0ZGVzY3JpcHRpb246IGAke2NvbnRleHQuZGVzY3JpcHRpb259YCxcblx0XHRcdFx0aGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuXHRcdFx0XHRydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTRfWCxcblx0XHRcdFx0Y29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFxuXHRcdFx0XHRcdGpvaW4oX19kaXJuYW1lLCBgLi4vc3JjL2xhbWJkYUVkZ2UvJHtlbnZ9YCksXG5cdFx0XHRcdCksXG5cdFx0XHR9LFxuXHRcdClcblxuXHRcdC8vIDUuIENsb3VkRnJvbnQgRGlzdHJpYnV0aW9u44KS5L2c5oiQXG5cdFx0Y29uc3Qgd2Vic2l0ZURpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkNsb3VkRnJvbnRXZWJEaXN0cmlidXRpb24oXG5cdFx0XHR0aGlzLFxuXHRcdFx0J1dlYnNpdGVEaXN0cmlidXRpb24nLFxuXHRcdFx0e1xuXHRcdFx0XHRjb21tZW50OiAnd2Vic2l0ZS1kaXN0cmlidXRpb24nLFxuXHRcdFx0XHRlcnJvckNvbmZpZ3VyYXRpb25zOiBbXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZXJyb3JDYWNoaW5nTWluVHRsOiAzMDAsXG5cdFx0XHRcdFx0XHRlcnJvckNvZGU6IDQwMyxcblx0XHRcdFx0XHRcdHJlc3BvbnNlQ29kZTogMjAwLFxuXHRcdFx0XHRcdFx0cmVzcG9uc2VQYWdlUGF0aDogJy9pbmRleC5odG1sJyxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGVycm9yQ2FjaGluZ01pblR0bDogMzAwLFxuXHRcdFx0XHRcdFx0ZXJyb3JDb2RlOiA0MDQsXG5cdFx0XHRcdFx0XHRyZXNwb25zZUNvZGU6IDIwMCxcblx0XHRcdFx0XHRcdHJlc3BvbnNlUGFnZVBhdGg6ICcvaW5kZXguaHRtbCcsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XSxcblx0XHRcdFx0Ly8gNi4gRGlzdHJpYnV0aW9u44GrT3JpZ2lu5oOF5aCx77yIUzMgQnVja2V044CBT3JpZ2luIEFjY2VzcyBJZGVudGl0ee+8ieOCkuioreWumlxuXHRcdFx0XHRvcmlnaW5Db25maWdzOiBbXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0czNPcmlnaW5Tb3VyY2U6IHtcblx0XHRcdFx0XHRcdFx0czNCdWNrZXRTb3VyY2U6IHdlYnNpdGVCdWNrZXQsXG5cdFx0XHRcdFx0XHRcdG9yaWdpbkFjY2Vzc0lkZW50aXR5OiB3ZWJzaXRlSWRlbnRpdHksXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0YmVoYXZpb3JzOiBbXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5DbG91ZEZyb250QWxsb3dlZE1ldGhvZHMuR0VUX0hFQUQsXG5cdFx0XHRcdFx0XHRcdFx0Y2FjaGVkTWV0aG9kczpcblx0XHRcdFx0XHRcdFx0XHRcdGNsb3VkZnJvbnQuQ2xvdWRGcm9udEFsbG93ZWRDYWNoZWRNZXRob2RzLkdFVF9IRUFELFxuXHRcdFx0XHRcdFx0XHRcdGlzRGVmYXVsdEJlaGF2aW9yOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRcdHZpZXdlclByb3RvY29sUG9saWN5OlxuXHRcdFx0XHRcdFx0XHRcdFx0Y2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcblx0XHRcdFx0XHRcdFx0XHQvLyDplqLmlbDjga7plqLpgKPku5jjgZFcblx0XHRcdFx0XHRcdFx0XHRsYW1iZGFGdW5jdGlvbkFzc29jaWF0aW9uczogW1xuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRldmVudFR5cGU6IGNsb3VkZnJvbnQuTGFtYmRhRWRnZUV2ZW50VHlwZS5WSUVXRVJfUkVRVUVTVCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGFtYmRhRnVuY3Rpb246IHdlYnNpdGVCYXNpY0F1dGhGdW5jdGlvbi5jdXJyZW50VmVyc2lvbixcblx0XHRcdFx0XHRcdFx0XHRcdFx0aW5jbHVkZUJvZHk6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRdLFxuXHRcdFx0XHQvLyDmlpnph5Hjgq/jg6njgrnvvJrljJfnsbPjgIHmrKflt57jgIHjgqLjgrjjgqLjgIHkuK3mnbHjgIHjgqLjg5Xjg6rjgqvjgpLkvb/nlKjjgZnjgotcblx0XHRcdFx0cHJpY2VDbGFzczogY2xvdWRmcm9udC5QcmljZUNsYXNzLlBSSUNFX0NMQVNTXzIwMCxcblx0XHRcdH0sXG5cdFx0KVxuXG5cdFx0Ly8gUzPjgavpnZnnmoTjg5XjgqHjgqTjg6vjgpLjgqLjg4Pjg5fjg63jg7zjg4njgZnjgovjgIJcblx0XHRuZXcgczNEZXBsb3ltZW50LkJ1Y2tldERlcGxveW1lbnQodGhpcywgJ1dlYnNpdGVEZXBsb3knLCB7XG5cdFx0XHRzb3VyY2VzOiBbczNEZXBsb3ltZW50LlNvdXJjZS5hc3NldCgnLi9zcmMvd2ViL2J1aWxkJyldLFxuXHRcdFx0ZGVzdGluYXRpb25CdWNrZXQ6IHdlYnNpdGVCdWNrZXQsXG5cdFx0XHRkaXN0cmlidXRpb246IHdlYnNpdGVEaXN0cmlidXRpb24sXG5cdFx0XHRkaXN0cmlidXRpb25QYXRoczogWycvKiddLFxuXHRcdH0pXG5cdH1cbn1cbiJdfQ==