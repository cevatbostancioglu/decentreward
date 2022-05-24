#!/bin/bash

source config.sh

set -x

export CONTRACT_PATH="${PWD}/scripts/contract.json"
export CONTRACT_ADDRESS_PATH="${PWD}/scripts/contract-address.json"

export FRONTEND_CONTRACT_PATH="${PWD}/frontend/rewards/src/assets/contract.json"
export FRONTEND_CONTRACT_ADDRESS_PATH="${PWD}/frontend/rewards/src/contracts/index.ts"

cat $CONTRACT_PATH | jq --raw-output ".abi" > $FRONTEND_CONTRACT_PATH

export new_contract_address=$(cat $CONTRACT_ADDRESS_PATH | jq --raw-output ".name")

echo "export const rewardContractAddress = \"$new_contract_address\";" > $FRONTEND_CONTRACT_ADDRESS_PATH
