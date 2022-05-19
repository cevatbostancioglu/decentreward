#!/bin/bash

source config.sh

set -x

npx hardhat run scripts/approve.js --network $NETWORK_NAME
