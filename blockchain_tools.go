package main

import (
	"fmt"
	"io/ioutil"
	"strings"
	"github.com/Jeffail/gabs"
)

func main() {
	// get the blockchain data from blockchain.json
	blockchainJson, err := ioutil.ReadFile("./blockchain.json")

	blockchain, err := gabs.ParseJSON(blockchainJson)
	confirmedTransactions, err := blockchain.Path("confirmed").Children()
	pendingTransactions, err := blockchain.Path("pending").Children()

	if err != nil {
		panic(err)
	}

	// parse and display the recorded transaction-blocks
	fmt.Println("--- CONFIRMED TRANSACTION-BLOCKS ---\n")
	for index, transaction := range confirmedTransactions {
		if index > 0 {
			fmt.Println("⛓")
		}

		fmt.Printf("Confirmee: %v\n", transaction.Path("confirmee").Data())
		fmt.Printf("Hash: %v\n", transaction.Path("hash").Data())
		fmt.Printf("Previous Hash: %v\n", transaction.Path("previousHash").Data())
		fmt.Printf("Timestamp: %v\n", transaction.Path("timestamp").Data())

		fmt.Printf("Data: %v\n", scrapeJson(transaction, index, "transaction"))

		snipped_public_key := transaction.Path("publicKey").Data().(string)[219:250]
		snipped_public_key = strings.Replace(snipped_public_key, "\n", "", -1)
		snipped_public_key = strings.Replace(snipped_public_key, "\\n", "", -1)
		fmt.Printf("Public Key: ...%v...\n", snipped_public_key)

		snipped_signed_tx := transaction.Path("transaction").Data().(string)[350:381]
		snipped_signed_tx = strings.Replace(snipped_signed_tx, "\n", "", -1)
		snipped_signed_tx = strings.Replace(snipped_signed_tx, "\\n", "", -1)
		fmt.Printf("Signed Transaction: ...%v...\n", snipped_signed_tx)
	}

	fmt.Println("\n\n")

	// parse and log the recorded pending transactions
	fmt.Println("--- PENDING TRANSACTION-BLOCKS ---\n")
	for index, transaction := range pendingTransactions {
		if index > 0 {
			fmt.Println("⛓")
		}

		fmt.Printf("From: %v\n", transaction.Path("from").Data())
		fmt.Printf("Hash: %v\n", transaction.Path("hash").Data())
		fmt.Printf("Timestamp: %v\n", transaction.Path("timestamp").Data())

		fmt.Printf("Data: %v\n", scrapeJson(transaction, index, "data"))

		snipped_public_key := transaction.Path("publicKey").Data().(string)[219:250]
		snipped_public_key = strings.Replace(snipped_public_key, "\n", "", -1)
		snipped_public_key = strings.Replace(snipped_public_key, "\\n", "", -1)
		fmt.Printf("Public Key: ...%v...\n", snipped_public_key)

		snipped_signed_tx := transaction.Path("data").Data().(string)[350:381]
		snipped_signed_tx = strings.Replace(snipped_signed_tx, "\n", "", -1)
		snipped_signed_tx = strings.Replace(snipped_signed_tx, "\\n", "", -1)
		fmt.Printf("Signed Transaction: ...%v...\n", snipped_signed_tx)
	}
}

// this is not smart
func scrapeJson(transaction *gabs.Container, index int, key string) *gabs.Container {
	// scrape the transaction (tx) data from the JSON string
	// tread carefully and wear eye protection
	tx_to_parse := transaction.Path(key).Data().(string)
	index_of_data_start := strings.Index(tx_to_parse, "{") // JSON starts with a `{`
	index_of_data_end := strings.Index(tx_to_parse, "}")

	if index_of_data_start == -1 || index_of_data_end == -1 {
		fmt.Printf("\n\nERROR ->\tMalformed transaction-block @ confirmed[%d]\n\n", index)
	}

	tx_data_string := strings.Replace(tx_to_parse[index_of_data_start:index_of_data_end + 1], "\\", "", -1)
	tx_data_json, err := gabs.ParseJSON([]byte(tx_data_string))

	if err != nil {
		panic(err)
	}

	return tx_data_json
}