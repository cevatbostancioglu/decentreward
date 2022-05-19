#!/bin/bash

source config.sh

set -x

npx hardhat run scripts/deploy_oracle.js --network $NETWORK_NAME
