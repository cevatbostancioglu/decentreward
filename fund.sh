#!/bin/bash

source config.sh

set -x

npx hardhat run scripts/fund.js --network $NETWORK_NAME
