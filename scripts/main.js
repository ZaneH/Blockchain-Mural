/* This is what a transaction looks like.
 * (unused) */
var transaction_template = {
  nonce: "",
  from: "",
  timestamp: "",
  data: ""
};

/* This is what a transaction block looks like.
 * (unused) */
var transaction_block_template = {
  confirmee: "",
  hash: "",
  previousHash: "",
  timestamp: ""
}

/* Pending Transactions
 * An array to hold the pending transactions on the Blockchain. This
 * data is pulled from the Go server's pending_transaction_blocks.json
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
  // set transaction blocks to the pending_transaction_blocks.json file on the Go server
  pullPendingTransactionBlocks(function(data) {
    pendingTransactions = data["pending"]; // pending_transaction_blocks.json stores the blocks in a "pending" array

    // console.log("[+] Retrieved pending transactions:\n" + JSON.stringify(pendingTransactions, null, 2));
    console.log("[+] Retrieved pending transactions from network");

    confirmPendingTransaction();
  });
}

/* Submit Vote
 * Builds a vote to submit to the Blockchain.
 */
function createVote() {
  console.log("[-] Generating key-pair...");
  // generates an openpgp key-pair (public and private)
  // this will be used later to sign the transaction and verify the contents
  var options = {
      userIds: [{ name:'', email:'' }],
      numBits: 4096
  };

  openpgp.generateKey(options).then(function(key) {
    var privkey = key.privateKeyArmored;
    var pubkey = key.publicKeyArmored;

    console.log("[+] Generated public and private key-pair");
  });
}

/* Confirm Pending Transaction
 * Takes the most recent pending transaction and attempts to
 * find a valid hash. A valid hash is one that starts with  "0000"
 * Invalid hash: "0a13dd2821089a900c06d87b3c615d8f0121b525a4c844b6da081d1626269dec"
 * Valid hash: "00002227b3cb6725bfd56300b29b79373cfe50eb6a441a07e1de49bed90b2383"
 */
function confirmPendingTransaction() {
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

  // setting up the transaction block to submit as Proof of Work
  var workingTransactionBlock = {
    confirmee: JSON.stringify(workingTransaction),
    hash: workingHash.toString(),
    previousHash: '0',
    timestamp: (Math.floor(Date.now() / 1000)).toString()
  };

  submitWorkingTransactionBlock(workingTransactionBlock, function() {
    // proof of work was submitted to server
  });

  // debug
  console.log("[+] Found valid hash: " + workingHash);
  console.log("[+] Hashes generated: " + hashCount);
  console.log("[+] Hash calculated in " + ((finish - start) / 1000).toString() + " seconds.");
  console.log("[+] Generated a transaction block:\n" + JSON.stringify(workingTransactionBlock, null, 2));
}