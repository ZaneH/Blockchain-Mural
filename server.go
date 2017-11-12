package main

import (
	"net/http"
	"fmt"
	"log"
	"encoding/json"
	"io/ioutil"
	"github.com/Jeffail/gabs"
	"time"
)

type Blockchain struct {
	Pending []interface{}
	Confirmed []interface{}
}

type Transaction struct {
	nonce string
	from string
	timestamp string
	data string
}

type TransactionBlock struct {
	Confirmee string
	Hash string
	PreviousHash string
	Timestamp string
	Transaction string
}

type VoteData struct {
	PublicKey string
	Message string
}

func main() {
	http.HandleFunc("/", UnhandledRequest)
	http.HandleFunc("/submit_transaction_block", SubmitTransactionBlock)
	http.HandleFunc("/submit_vote", SubmitVote);
	http.HandleFunc("/blockchain.json", PendingTransactionBlocks)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// handle proof of works that have been submitted by clients
func SubmitTransactionBlock(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	jsonBody, err := ioutil.ReadAll(r.Body)
	transactionJson, err := gabs.ParseJSON(jsonBody)
	if err != nil {
		panic(err)
	}


	fmt.Printf("%v\n\n", transactionJson)
}

func SubmitVote(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	decoder := json.NewDecoder(r.Body)
	var jsonData VoteData

	err := decoder.Decode(&jsonData)
	if err != nil {
		panic(err)
	}

	WriteTransactionToFile(jsonData.PublicKey, jsonData.Message)
}

func WriteTransactionToFile(pubkey string, data string) {
	dat, err := ioutil.ReadFile("./blockchain.json")
	if err != nil {
		panic(err)
	}

	blockchain, err := gabs.ParseJSON(dat)

	newTransaction := gabs.New()
	newTransaction.Set("0", "nonce")
	newTransaction.Set("0", "from")
	newTransaction.Set(time.Now().Unix(), "timestamp")
	newTransaction.Set(data, "data")
	blockchain.ArrayAppend(newTransaction.Data(), "pending")

	ioutil.WriteFile("blockchain.json", []byte(blockchain.StringIndent("", "  ")), 0644)
}

// print contents of pending_transaction_blocks.json in plain-text
func PendingTransactionBlocks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	http.ServeFile(w, r, "blockchain.json")
}

func UnhandledRequest(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "You've stumbled across a side-project -- move along.")
}