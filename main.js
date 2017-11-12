// this "genesis" transaction gives the first person something to confirm
var genesisTransaction = {
  nonce: "",
  from: "",
  timestamp: "",
  data: ""
};

var pendingTransactions = [genesisTransaction];

/* Transaction Blocks
 * This project is to demonstrate how a Blockchain works and
 * as such isn't meant to hold any real value. In an applied
 * Blockchain that holds value, a block would be made up of
 * more than one transaction.
 */
var transactionBlocks = [];

function startProcess() {
  // set transaction blocks to the pending_transaction_blocks.json file on the Go server
  transactionBlocks = pullPendingTransactionBlocks(function(data) {
    transactionBlocks = data;
    console.log(transactionBlocks);
    // TODO: process pending transaction blocks
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

  var re = new RegExp("^[a-f]{2}");

  do {
    workingTransaction.nonce = Math.random().toString(); // prevents the same hash from being generated twice
    workingHash = sha256(workingTransaction.nonce + workingTransaction.from + workingTransaction.timestamp + workingHash.data);
  } while (re.exec(workingHash) == null);

  var workingTransactionBlock = {
    transaction: JSON.stringify(workingTransaction),
    transactionBlockHash: workingHash.toString(),
    previousTransactionBlockHash: '0',
    date: (Math.floor(Date.now() / 1000)).toString()
  };

  console.log("[+] Found valid hash: " + workingHash);
  console.log("[+] Generated a transaction block:\n" + JSON.stringify(workingTransactionBlock));
}