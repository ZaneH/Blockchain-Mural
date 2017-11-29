class Transaction {
  constructor(from, timestamp, data) {
    this.from = from;
    this.timestamp = timestamp;
    this.data = data;
  }
}

class TransactionBlock {
  constructor(confirmee, hash, previousHash, timestamp) {
    this.confirmee = confirmee;
    this.hash = hash;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
  }
}

/* Pending Transactions
 * An array to hold the pending transactions on the Blockchain. This
 * data is pulled from the Go server's blockchain.json
 */
var pendingTransactions = [];

/* Transaction Blocks
 * This project is to demonstrate how a Blockchain works and
 * as such isn't meant to hold any real value. In an applied
 * Blockchain that holds value, a block would be made up of
 * more than one transaction.
 */
var transactionBlocks = [];

function startMining() {
  // set transaction-blocks to the blockchain.json file on the Go server
  pullPendingTransactionBlocks(function(data) {
    pendingTransactions = data["pending"]; // blockchain.json stores the blocks in a "pending" array

    console.log("[+] Retrieved pending transactions from network");

    confirmPendingTransaction();
  });
}

/* Submit Vote
 * Builds a vote to submit to the Blockchain.
 */
function createVote() {
  console.log("[-] Generating key-pair...");
  // generates a key-pair (public and private)
  // this will be used later to sign the transaction and verify the contents

  // PLEASE DO NOT USE THE GENERATED KEYS IN THE REAL WORLD
  var options = {
      userIds: [{ name: "", email: "" }],
      numBits: 4096
  };

  openpgp.generateKey(options).then(function(key) {
    var privkey = key.privateKeyArmored;
    var pubkey = key.publicKeyArmored;

    console.log("[+] Generated public and private key-pair");

    var privKeyObj = openpgp.key.readArmored(privkey).keys;

    var voteInput = document.getElementById("voteinput").value;

    // Transaction: nonce, from, timestamp, data
    var voteToSign = new Transaction(generateSafeName(), Date.now().toString(), voteInput);
    var jsonVote = JSON.stringify(voteToSign);

    var options = {
        data: JSON.stringify(voteToSign),
        privateKeys: privKeyObj
    };

    console.log("[-] Signing vote...");
    openpgp.sign(options).then(function(signed) {
        cleartext = signed.data;
        console.log("[+] Signed vote");

        var postData = {
          publickey: pubkey, // public key
          message: cleartext, // signed message
          raw: jsonVote
        };

        // submits the postData variable to the Go server
        console.log("[-] Submitting vote to server...")
        submitVote(JSON.stringify(postData), function(response) {
          console.log("[+] Server said: \"" + response + "\"");
        });
    });
  });
}

/* Confirm Pending Transaction
 * Takes the most recent pending transaction and attempts to
 * find a valid hash. A valid hash is one that starts with  "0000"
 * Invalid hash: "0a13dd2821089a900c06d87b3c615d8f0121b525a4c844b6da081d1626269dec"
 * Valid hash: "00002227b3cb6725bfd56300b29b79373cfe50eb6a441a07e1de49bed90b2383"
 */
function confirmPendingTransaction() {
  // workingTransaction is the most recent transaction on the blockchain
  // it's used later as its own "Proof of Work" (https://en.wikipedia.org/wiki/Proof-of-work_system)
  var workingTransaction = pendingTransactions[0];
  var workingHash = "";

  // counts how many hashes were generated before one is found
  var hashCount = 0;

  // regex filter to validate hash requirements ("0000" prefix)
  // this prefix is entirely arbitrary and is what determines the "difficulty"
  var re = new RegExp("^0000");

  // the start and finish variables let us time the hash calculation
  var start = performance.now();
  do {
    workingTransaction.nonce = Math.random().toString(); // prevents the same hash from being generated twice
    workingHash = sha256(workingTransaction.nonce + workingTransaction.from + workingTransaction.timestamp + workingHash.data); // calculates hash from transaction

    hashCount++;
  } while (re.exec(workingHash) == null);
  var finish = performance.now();

  // setting up the transaction-block to submit as Proof of Work
  var workingTransactionBlock = {
    confirmee: "none",
    hash: workingHash.toString(),
    previousHash: '0',
    timestamp: (Math.floor(Date.now() / 1000)).toString(),
    transaction: JSON.stringify(workingTransaction)
  };

  submitWorkingTransactionBlock(JSON.stringify(workingTransactionBlock), function(data) {
    // proof of work was submitted to server
    console.log(data)
  });

  // debug
  console.log("[+] Found valid hash: " + workingHash);
  console.log("[+] Hashes generated: " + hashCount);
  console.log("[+] Hash calculated in " + ((finish - start) / 1000).toString() + " seconds.");
  console.log("[+] Generated a transaction-block:\n" + JSON.stringify(workingTransactionBlock, null, 2));
}

/* Generate Safe Name
 * Generates a 'username' for the transaction. It'd be cool to let people
 * choose their own names...but this will hopefully be on a college campus.
 */
function generateSafeName() {
  var adjectives = [
    "Corny",
    "Graphing",
    "Laughing",
    "Speedy",
    "Rational",
    "Leaping",
    "Sour"
  ];

  var nouns = [
    "Hacker",
    "Gopher",
    "Rabbit",
    "Diver",
    "Cheetah",
    "Boar",
    "Santa"
  ];

  randomAdjectiveIndex = Math.floor((Math.random() * 100) % adjectives.length);
  randomNounIndex = Math.floor((Math.random() * 100) % nouns.length);
  randomIndex = Math.floor((Math.random() * 100));

  return (adjectives[randomAdjectiveIndex] + nouns[randomNounIndex] + randomIndex).toString();
}