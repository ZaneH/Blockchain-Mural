package main

import (
	"net/http"
	"fmt"
	"log"
	"encoding/json"
	"io/ioutil"
	"time"
	"strconv"
	"github.com/Jeffail/gabs"
)

type Blockchain struct {
	Pending []interface{}
	Confirmed []interface{}
}

type Transaction struct {
	Nonce string
	From string
	Timestamp string
	Data string
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
	Raw string
}

func main() {
	// tfw Go makes writing an api fun
	http.HandleFunc("/", UnhandledRequest)
	http.HandleFunc("/submit_transaction_block", SubmitTransactionBlock)
	http.HandleFunc("/submit_vote", ProcessVote);
	http.HandleFunc("/blockchain.json", PendingTransactionBlocks)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// handle proof of works that have been submitted by clients
func SubmitTransactionBlock(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	jsonBody, err := ioutil.ReadAll(r.Body)
	transaction, err := gabs.ParseJSON(jsonBody)

	blockchainJson, err := ioutil.ReadFile("./blockchain.json")
	blockchain, err := gabs.ParseJSON(blockchainJson)

	if err != nil {
		panic(err)
	}

	// sets the previous hash to the hash of the block before it
	confirmedTransactions, _ := blockchain.Path("confirmed").Children()
	// make sure confirmedTransactions actually has a previous block
	if (len(confirmedTransactions) > 0) {
		previousTransaction := confirmedTransactions[len(confirmedTransactions) - 1]
		transaction.Set(previousTransaction.Path("hash").Data(), "previousHash")
	} else {
		transaction.Set("0000000000000000000000000000000000000000000000000000000000000000", "previousHash")
	}

	// add the transaction to the confirmed transactions
	blockchain.ArrayAppend(transaction.Data(), "confirmed")

	// removes the most recent transaction (this might be dangerous when scaled...)
	blockchain.ArrayRemoveP(0, "pending")

	blockchainString := blockchain.StringIndent("", "  ")
	ioutil.WriteFile("blockchain.json", []byte(blockchainString), 0644)
}

func ProcessVote(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	decoder := json.NewDecoder(r.Body)
	var jsonData VoteData

	err := decoder.Decode(&jsonData)
	if err != nil {
		panic(err)
	}

	fmt.Fprintf(w, "Thanks!")
	WritePendingTransactionToFile(jsonData.PublicKey, jsonData.Message, jsonData.Raw)
}

func WritePendingTransactionToFile(pubkey string, signed_message string, raw string) {
	blockchainJson, err := ioutil.ReadFile("./blockchain.json")

	if err != nil {
		panic(err)
	}

	blockchain, err := gabs.ParseJSON(blockchainJson)
	transaction, err := gabs.ParseJSON([]byte(raw))

	// creates a transaction to be sent to "pending"
	newTransaction := gabs.New()
	newTransaction.Set(transaction.Path("hash").Data(), "hash")
	newTransaction.Set(transaction.Path("from").Data(), "from")
	newTransaction.Set(strconv.FormatInt(int64(time.Now().Unix()), 10), "timestamp")
	newTransaction.Set(pubkey, "publicKey")
	newTransaction.Set(signed_message, "data")

	blockchain.ArrayAppend(newTransaction.Data(), "pending")

	ioutil.WriteFile("blockchain.json", []byte(blockchain.StringIndent("", "  ")), 0644)
	fmt.Println("[+] Wrote pending transaction to file")
}

// print contents of blockchain.json in plain-text
func PendingTransactionBlocks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	http.ServeFile(w, r, "blockchain.json")
}

func UnhandledRequest(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "You've stumbled across a side-project -- move along.")
}