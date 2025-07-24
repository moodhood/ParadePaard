#!/bin/bash
set -euo pipefail

# 1) dummy creds so CLI won't bail
export AWS_ACCESS_KEY_ID=foo
export AWS_SECRET_ACCESS_KEY=bar
export AWS_DEFAULT_REGION=us-east-1

ENDPOINT="http://localhost:4566"

# 2) tear down and rebuild
aws --endpoint-url=$ENDPOINT cloudformation delete-stack \
    --stack-name project-management

aws --endpoint-url=$ENDPOINT cloudformation deploy \
    --stack-name project-management \
    --template-file "./cdk.out/localstack.template.json" \
|| {
    echo ">>> Deployment failed. Fetching stack events:"
    aws --endpoint-url=$ENDPOINT cloudformation describe-stack-events \
        --stack-name project-management
    exit 1
}

# 3) show LB info
aws --endpoint-url=$ENDPOINT elbv2 describe-load-balancers \
    --query "LoadBalancers[].{Name:LoadBalancerName, DNS:DNSName}"
