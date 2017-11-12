function pullPendingTransactionBlocks(callback) {
	$.get("http://localhost:8080/pending_transaction_blocks.json", callback);
}

function submitWorkingTransactionBlock(transactionBlock, callback) {
	$.ajax({
		type: "POST",
		url: "http://localhost:8080/submit_transaction_block",
		data: transactionBlock,
		success: callback
	});
}

function submitVote(postData, callback) {
	$.ajax({
		type: "POST",
		url: "http://localhost:8080/submit_vote",
		data: postData,
		success: callback
	});
}