#!/bin/bash

source config.sh

set -x

contract_address=$(cat scripts/contract-address.json | jq --raw-output ".name")
oracle_contract_address=$(cat scripts/oracle-contract-address.json | jq --raw-output ".name")

npx hardhat verify --network ${NETWORK_NAME} ${contract_address} "${RINKEBY_LINK_TOKEN_CONTRACT_ADDRESS}" "${oracle_contract_address}"
