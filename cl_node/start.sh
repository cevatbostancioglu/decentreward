#!/bin/bash

set -x

docker run --network=host \
    -v ~/.chainlink-kovan:/chainlink \
    -it --env-file=.env \
    smartcontract/chainlink:1.3.0 \
    local n -p /chainlink/cl_node/.password -a /chainlink/cl_node/.api
