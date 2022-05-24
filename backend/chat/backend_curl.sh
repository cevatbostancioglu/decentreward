#!/bin/bash

set -x
echo "\n"; sleep 5
curl -X POST -H "content-type:application/json" "http://localhost:5000/getContestState" --data '{ "tweetID": "1521567084358078465"}'
echo "\n"; echo "\n"; sleep 5
curl -X POST -H "content-type:application/json" "http://localhost:5000/getContestRewardAmount" --data '{ "tweetID": "1521567084358078465"}'
echo "\n"; sleep 5
curl -X POST -H "content-type:application/json" "http://localhost:5000/getContestEtherBalanceWithAdress" --data '{ "tweetID": "1521567084358078465"}'
echo "\n"; sleep 5
curl -X POST -H "content-type:application/json" "http://localhost:5000/getProofLocation" --data '{ "tweetID": "1521567084358078465"}'
echo "\n"; sleep 5
curl -X POST -H "content-type:application/json" "http://localhost:5000/getRandomSeed" --data '{ "tweetID": "1521567084358078465"}'
echo "\n"; sleep 5
curl -X POST -H "content-type:application/json" "http://localhost:5000/getWinnerTwitterID" --data '{ "tweetID": "1521567084358078465"}'

echo "\n"; sleep 5

curl -X POST -H "content-type:application/json" "http://localhost:5000/getEtherBalanceWithAddress" --data '{ "address": "0x06b911ACca1000823054D9f17424198b076faF86"}'
