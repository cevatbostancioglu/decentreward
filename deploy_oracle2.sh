#!/bin/bash

source config.sh

set -x

npx hardhat run scripts/deploy_oracle2.js --network $NETWORK_NAME
