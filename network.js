function pullPendingTransactionBlocks() {
	$.get( "http://104.131.6.207:8080/pending_transaction_blocks.json", function(data) {
	  alert( "Data Loaded: " + data );
	});
}