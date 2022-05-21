const fs = require('fs');

async function main () {
    if (process.argv.length != 3)
    {
        console.log("node proof.js <filename, proof_...>.json");
        return;
    }

    const inputfile = JSON.parse(fs.readFileSync(process.argv[2]));

    var randSeed = parseInt(inputfile.input.data.randSeed.hex)
    var len = inputfile.tweetliked.length;
    var index = randSeed % len;
    var winner = inputfile.tweetliked[index];
    console.log("proof randSeed = ", randSeed);
    console.log("proof size of tweetliked:", len);
    console.log("proof winner index = ", index);
    console.log("winner calculated from proof:", winner);
    console.log("winner in proof", inputfile.winnerTwitterInfo);
    if ( winner.id == inputfile.winnerTwitterInfo.id)
    {
        console.log("Proof succsesfully executed.");
    }
    else
    {
        console.log("Proof failed, not able to execute proof, real winner:", winner);
    }
}
  
main()