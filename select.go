package main

import (
	"net/http"
	"log"
)

func main() {
    http.HandleFunc("/pending_transaction_blocks.json", PendingTransactionBlocks)

    log.Fatal(http.ListenAndServe(":8080", nil))
}

func PendingTransactionBlocks(w http.ResponseWriter, r *http.Request) {
	// w.Header().Set("Access-Control-Allow-Origin", "*")
	http.ServeFile(w, r, "pending_transaction_blocks.json")
}