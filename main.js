function generateHash(data) {
  return sha256(data);
}

function generateValidHash() {
  // this function uses generateHash() to generate
  // hashes until the first 2 characters are letters from A-F
  var dataSuffix = "Attempt: #";
  var dataSuffixCounter = 0;

  var voteData = document.getElementById('voteinput').value;

  var block = { // all values are strings for consistency
    index: '0',
    timestamp: (Math.floor(Date.now() / 1000)).toString(),
    previousHash: '0',
    data: voteData, // data will look like: "I vote for X Attempt: #X"
    currentHash: '0'
  };

  // if the hash doesn't start with 2 letters, loop
  var re = new RegExp("^[a-f]{2}");
  do {
    // generate a hash with the given data
    block.currentHash = generateHash(block.index + block.timestamp + block.previousHash +
      block.data + " " + dataSuffix + dataSuffixCounter +
      block.currentHash);

    // increment the counter so that a unique hash can be generated if
    // the first hash doesn't have a prefix of 2 letters
    dataSuffixCounter++;
    console.log("[-] Generated\t" + block.currentHash);
  } while (re.exec(block.currentHash) == null);

  // update block.data to contain the data of a valid hash
  block.data = voteData + " " + dataSuffix + dataSuffixCounter;
  console.log("[+] Found:\n" + JSON.stringify(block, null, 2));
}