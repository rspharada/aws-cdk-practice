#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const cdk_cloud_front_s3_static_website_stack_1 = require("../lib/cdk-cloud-front-s3-static-website-stack");
require("dotenv/config");
const app = new cdk.App();
new cdk_cloud_front_s3_static_website_stack_1.CdkCloudFrontS3StaticWebSiteStack(app, 'CdkCloudFrontS3StaticWebSiteStack', {
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
    env: { region: 'ap-northeast-1' },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLWNsb3VkLWZyb250LXMzLXN0YXRpYy13ZWJzaXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLWNsb3VkLWZyb250LXMzLXN0YXRpYy13ZWJzaXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVDQUFvQztBQUNwQyxtQ0FBa0M7QUFDbEMsNEdBQWtHO0FBQ2xHLHlCQUFzQjtBQUV0QixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUN6QixJQUFJLDJFQUFpQyxDQUNwQyxHQUFHLEVBQ0gsbUNBQW1DLEVBQ25DO0lBQ0M7O3FFQUVpRTtJQUNqRTt1RUFDbUU7SUFDbkUsNkZBQTZGO0lBQzdGO3NDQUNrQztJQUNsQyx5REFBeUQ7SUFDekQsOEZBQThGO0lBQzlGLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRTtDQUNqQyxDQUNELENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcidcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IENka0Nsb3VkRnJvbnRTM1N0YXRpY1dlYlNpdGVTdGFjayB9IGZyb20gJy4uL2xpYi9jZGstY2xvdWQtZnJvbnQtczMtc3RhdGljLXdlYnNpdGUtc3RhY2snXG5pbXBvcnQgJ2RvdGVudi9jb25maWcnXG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKClcbm5ldyBDZGtDbG91ZEZyb250UzNTdGF0aWNXZWJTaXRlU3RhY2soXG5cdGFwcCxcblx0J0Nka0Nsb3VkRnJvbnRTM1N0YXRpY1dlYlNpdGVTdGFjaycsXG5cdHtcblx0XHQvKiBJZiB5b3UgZG9uJ3Qgc3BlY2lmeSAnZW52JywgdGhpcyBzdGFjayB3aWxsIGJlIGVudmlyb25tZW50LWFnbm9zdGljLlxuXHRcdCAqIEFjY291bnQvUmVnaW9uLWRlcGVuZGVudCBmZWF0dXJlcyBhbmQgY29udGV4dCBsb29rdXBzIHdpbGwgbm90IHdvcmssXG5cdFx0ICogYnV0IGEgc2luZ2xlIHN5bnRoZXNpemVkIHRlbXBsYXRlIGNhbiBiZSBkZXBsb3llZCBhbnl3aGVyZS4gKi9cblx0XHQvKiBVbmNvbW1lbnQgdGhlIG5leHQgbGluZSB0byBzcGVjaWFsaXplIHRoaXMgc3RhY2sgZm9yIHRoZSBBV1MgQWNjb3VudFxuXHRcdCAqIGFuZCBSZWdpb24gdGhhdCBhcmUgaW1wbGllZCBieSB0aGUgY3VycmVudCBDTEkgY29uZmlndXJhdGlvbi4gKi9cblx0XHQvLyBlbnY6IHsgYWNjb3VudDogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfQUNDT1VOVCwgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT04gfSxcblx0XHQvKiBVbmNvbW1lbnQgdGhlIG5leHQgbGluZSBpZiB5b3Uga25vdyBleGFjdGx5IHdoYXQgQWNjb3VudCBhbmQgUmVnaW9uIHlvdVxuXHRcdCAqIHdhbnQgdG8gZGVwbG95IHRoZSBzdGFjayB0by4gKi9cblx0XHQvLyBlbnY6IHsgYWNjb3VudDogJzEyMzQ1Njc4OTAxMicsIHJlZ2lvbjogJ3VzLWVhc3QtMScgfSxcblx0XHQvKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiwgc2VlIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9jZGsvbGF0ZXN0L2d1aWRlL2Vudmlyb25tZW50cy5odG1sICovXG5cdFx0ZW52OiB7IHJlZ2lvbjogJ2FwLW5vcnRoZWFzdC0xJyB9LFxuXHR9LFxuKVxuIl19