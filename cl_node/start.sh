#!/bin/bash

set -x

# chainlink vrf async wait.
docker run --network=host \
    -v ~/.chainlink-kovan/decentreward/:/chainlink \
    -it --env-file=.env \
    -e DEFAULT_HTTP_TIMEOUT="600s" \
    smartcontract/chainlink:1.3.0 \
    local n -p /chainlink/cl_node/.password -a /chainlink/cl_node/.api
