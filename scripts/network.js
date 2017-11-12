function pullPendingTransactionBlocks(callback) {
	$.get("http://104.131.6.207/pending_transaction_blocks.json", callback);
}

function submitWorkingTransactionBlock(transactionBlock, callback) {
	$.ajax({
		type: "POST",
		url: "http://104.131.6.207",
		data: transactionBlock,
		success: callback
	});
}