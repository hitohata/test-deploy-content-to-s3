#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DeployFrontStack } from '../lib/deploy-front-stack';

const stage = () => {
    return 'prod';
    if (process.env.STAGE === 'prod') {
        return 'prod'
    } else {
        return 'dev'
    }
};

const app = new cdk.App();
new DeployFrontStack(app, `DeployFrontStack-${stage()}`, {
    stage: stage()
});