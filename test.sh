#!/bin/bash

source config.sh

set -x

npx hardhat test
