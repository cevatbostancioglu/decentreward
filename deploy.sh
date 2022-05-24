#!/bin/bash

source config.sh

set -x

npx hardhat run scripts/deploy.js --network $NETWORK_NAME

bash update_frontend_contracts.sh
