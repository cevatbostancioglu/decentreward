#!/bin/bash

source config.sh

set -x
if [ "$NETWORK_NAME" = "rinkeby" ]; then
KOVAN_LINK_TOKEN_CONTRACT_ADDRESS=RINKEBY_LINK_TOKEN_CONTRACT_ADDRESS
else
KOVAN_LINK_TOKEN_CONTRACT_ADDRESS=KOVAN_LINK_TOKEN_CONTRACT_ADDRESS
fi

npx hardhat verify --network ${NETWORK_NAME} $(cat scripts/contract-address.json | jq --raw-output ".name") "${KOVAN_LINK_TOKEN_CONTRACT_ADDRESS}"