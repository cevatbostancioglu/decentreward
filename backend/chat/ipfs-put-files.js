require('dotenv').config({path: './.env.twitter'});
// Include fs and path module
const fs = require('fs');
const path = require('path');

const { Web3Storage, getFilesFromPath } = require('web3.storage');

const isEmpty = (value) => (
  value === undefined ||
  value === null ||
  (typeof value === 'object' && Object.keys(value).length === 0) ||
  (typeof value === 'string' && value.trim().length === 0)
)

const ipfsUpload = async function(input, tweetliked) {
  const token = process.env.WEB3STORAGE_API_TOKEN;

  if (!token) {
    return console.error('A token is needed. You can create one on https://web3.storage');
  }
  const storage = new Web3Storage({ token });

  var local_proof_directory = 'proofs/' + input.id + '/' + input.meta.oracleRequest.requestId;
  var local_proof_file = 'proof_' + input.data.tweetID + ".json";

  fs.mkdirSync(path.join(__dirname, local_proof_directory), {recursive: true});

  var winnerIndex = input.data.randSeed % tweetliked.length;
  var winner = tweetliked[winnerIndex];

  var finalJson = { };
  var proof_formula = "tweetliked[input.data.randSeed % tweetliked.length]";

  finalJson["input"] = input;
  finalJson["tweetliked"] = tweetliked;
  finalJson["proof_formula"] = proof_formula;
  finalJson["winnerIndex"] = winnerIndex;
  finalJson["winnerTwitterInfo"] = winner; 
  fs.writeFileSync(
    local_proof_directory + "/" + local_proof_file,
    JSON.stringify(finalJson, null, '\t')
  );

  const files = [];
  const pathFiles = await getFilesFromPath(local_proof_directory + '/' + local_proof_file);
  files.push(...pathFiles);

  console.log("localPath:", local_proof_directory + "/" + local_proof_file);
  console.log(`Uploading ${files.length} proof files`);
  const cid = await storage.put(files);
  console.log('Content added with CID:', cid);
  
  // case
  // https://bafybeigraa5z2asq4rgyimi7bpbleuk55cljft35n2wfx52ixcppaugue4.ipfs.dweb.link/proof_1529578847640899589.json
  if(tweetliked.length == 0)
  {
    return [input.data.tweetID, "0", cid];
  }
  else
  {
    return [input.data.tweetID, winner.id, cid]; 
  }
}

module.exports = {
    ipfsUpload
};
