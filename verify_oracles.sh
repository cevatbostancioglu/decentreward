#!/bin/bash

source config.sh

set -x
oracle_contract_address=$(cat scripts/oracle-contract-address.json | jq --raw-output ".name")
npx hardhat verify --network ${NETWORK_NAME} ${oracle_contract_address} "${RINKEBY_LINK_TOKEN_CONTRACT_ADDRESS}" "0x06b911ACca1000823054D9f17424198b076faF86"
npx hardhat verify --network ${NETWORK_NAME} $(cat scripts/consumer-contract-address.json | jq --raw-output ".name") "${RINKEBY_LINK_TOKEN_CONTRACT_ADDRESS}" ${oracle_contract_address}
