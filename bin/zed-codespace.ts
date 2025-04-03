#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ZedCodespaceStack } from "../lib/zed-codespace-stack";

const app = new cdk.App();

new ZedCodespaceStack(app, "ZedCodespaceStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
