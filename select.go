package main

import (
"net/http"
"fmt"
"log"
"encoding/json"
)

type TransactionBlock struct {
	Confirmee string
	Hash string
	PreviousHash string
	Timestamp string
}

func main() {
	http.HandleFunc("/", UnhandledRequest)
	http.HandleFunc("/pending_transaction_blocks.json", PendingTransactionBlocks)
	http.HandleFunc("/submit_transaction_block", SubmitTransactionBlock)
	log.Fatal(http.ListenAndServe(":80", nil))
}

// handle proof of works that have been submitted by clients
func SubmitTransactionBlock(w http.ResponseWriter, r *http.Request) {
	// decode JSON object
	decoder := json.NewDecoder(r.Body)

	var jsonData TransactionBlock
	err := decoder.Decode(&jsonData)
	if err != nil {
		panic(err)
	}

	/* Keys for the jsonData variable
	 * jsonData.Confirmee
	 * jsonData.Hash
	 * jsonData.PreviousHash
	 * jsonData.Timestamp
	 */

	 
}

// print contents of pending_transaction_blocks.json in plain-text
func PendingTransactionBlocks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	http.ServeFile(w, r, "pending_transaction_blocks.json")
}

func UnhandledRequest(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "You've stumbled across a side-project -- move along.")
}