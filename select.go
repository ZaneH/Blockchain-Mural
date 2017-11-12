package main

import (
  "net/http"
  "fmt"
  "log"
)

func main() {
  http.HandleFunc("/", UnhandledRequest)
  http.HandleFunc("/pending_transaction_blocks.json", PendingTransactionBlocks)
  log.Fatal(http.ListenAndServe(":80", nil))
}

func PendingTransactionBlocks(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Access-Control-Allow-Origin", "*")
  http.ServeFile(w, r, "pending_transaction_blocks.json")
}

func UnhandledRequest(w http.ResponseWriter, r *http.Request) {
  fmt.Fprintf(w, "You've stumbled across a side-project -- move along.")
}