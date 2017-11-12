function pullPendingTransactionBlocks(callback) {
	$.get("http://104.131.6.207/pending_transaction_blocks.json", callback);
}

function submitWorkingTransactionBlock(transactionBlock, callback) {
	$.ajax({
		type: "POST",
		url: "http://104.131.6.207/submit_transaction_block",
		data: transactionBlock,
		success: callback
	});
}

function submitVote(postData, callback) {
	$.ajax({
		type: "POST",
		url: "http://104.131.6.207/submit_vote",
		data: postData,
		success: callback
	});
}