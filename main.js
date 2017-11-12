/* This is what a transaction looks like.
 * (unused) */
var __unused_transaction_template = {
  nonce: "",
  from: "",
  timestamp: "",
  data: ""
};

/* This is what a transaction block looks like.
 * (unused) */
var __unused_transaction_block_template = {
  transaction: "",
  transactionBlockHash: "",
  previousTransactionBlockHash: "",
  timestamp: ""
}

var pendingTransactions = [];

/* Transaction Blocks
 * This project is to demonstrate how a Blockchain works and
 * as such isn't meant to hold any real value. In an applied
 * Blockchain that holds value, a block would be made up of
 * more than one transaction.
 */
var transactionBlocks = [];

function startProcess() {
  // set transaction blocks to the pending_transaction_blocks.json file on the Go server
  pullPendingTransactionBlocks(function(data) {
    pendingTransactions = data["pending"]; // pending_transaction_blocks.json stores the blocks in a "pending" array
    console.log("[+] Retrieved pending transaction blocks:\n" + JSON.stringify(pendingTransactions, null, 2));
    // TODO: process pending transaction blocks

    confirmPendingTransaction();
  });
}

/* Confirm Pending Transaction
 * Takes the most recent pending transaction and attempts to
 * find a valid hash. A valid hash is one that starts with 2
 * letters. 
 * Invalid hash: "a4..."
 * Valid hash: "bc..."
 */
function confirmPendingTransaction() {
  workingTransaction = pendingTransactions[0];
  workingHash = "";
  
  var re = new RegExp("^[a-f]{9}");

  do {
    workingTransaction.nonce = Math.random().toString(); // prevents the same hash from being generated twice
    workingHash = sha256(workingTransaction.nonce + workingTransaction.from + workingTransaction.timestamp + workingHash.data);
  } while (re.exec(workingHash) == null);

  var workingTransactionBlock = {
    transaction: JSON.stringify(workingTransaction, null, 2),
    transactionBlockHash: workingHash.toString(),
    previousTransactionBlockHash: '0',
    timestamp: (Math.floor(Date.now() / 1000)).toString()
  };

  console.log("[+] Found valid hash: " + workingHash);
  console.log("[+] Generated a transaction block:\n" + JSON.stringify(workingTransactionBlock, null, 2));
}