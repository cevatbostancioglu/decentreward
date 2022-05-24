#!/bin/bash

set -x
##https://support.chainstack.com/hc/en-us/articles/900001664463-Setting-up-a-Chainlink-node-with-an-Ethereum-node-provided-by-Chainstack

exit 0


mkdir -p ~/.chainlink-kovan/db

docker run --name postgres-chainlink -v $HOME/.chainlink-kovan/db:/var/lib/postgresql/data -e POSTGRES_PASSWORD=myPostgresPW -d -p 5432:5432 postgres:11.12
docker exec -it postgres-chainlink psql -U postgres -c "CREATE USER chainlink WITH PASSWORD 'myChainlinkPW';"
docker exec -it postgres-chainlink psql -U postgres -c "CREATE DATABASE "chainlink_kovan";"
docker exec -it postgres-chainlink psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE "chainlink_kovan" TO chainlink;"
