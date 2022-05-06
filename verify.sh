#!/bin/bash

source config.sh

set -x

npx hardhat verify --network kovan $(cat scripts/contract-address.json | jq --raw-output ".name") "${KOVAN_LINK_TOKEN_CONTRACT_ADDRESS}"
