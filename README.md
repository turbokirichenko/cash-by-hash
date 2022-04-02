# CaSh By HaSh [beta]
### a node cli bitcoin wallet (testnet | mainnet)
---
![alt text](https://img.shields.io/badge/bitcoin-wallet-yellow|"none")
![alt text](https://img.shields.io/badge/btc%20test-mvwWrWtiToK6RJ1iyQh1EgQpWgJwV2NgVv-brightgreen?style=flat-square)
![alt text](https://img.shields.io/github/watchers/turbokirichenko/cash-by-hash?style=flat-square)
![alt text](https://img.shields.io/npm/dy/cash-by-hash?style=flat-square)

## Prologue

#### A good thing to get to know the bitcoin network better.

---
* alpha (deprecated)
* beta (now) __<<< we are here__
* full version (next release)
---

## Intall wallet

```
$ npm install -g cash-by-hash

``` 

## Initialization wallet

```
// locally: ( ./wallets.list )
$ cash-by-hash init

// globally: ( node_modules/cash-by-hash/wallets.list )
$ sudo cash-by-hash init --global

```

## Base actions
### > add new account to ./wallets.list
```
//by default
$ cash-by-hash addacc <NEW_ACCOUNT_NAME>

//in btc main network
$ cash-by-hash addacc <NEW_ACCOUNT_NAME> --network BTCMAIN

//WARNING!!!
//Remember your password or save it in the security place!!!
//You won't be able to use or recover your account without a password
```
### > account info
```
//deposit address
$ cash-by-hash deposit <ACCOUNT_NAME>

//open private key
$ cash-by-hash openkey <ACCOUNT_NAME>

//get current balance
$ cash-by-hash balance <ACCOUNT_NAME>

//delete account
$ cash-by-hash delete <ACCOUNT_NAME>
```

### > address info
```
$ cash-by-hash amount <BTC_ADDRESS>
```
### > broadcast transaction
```
$ cash-by-hash send-from <ACCOUNT_NAME> --to <ADDRESS>
```
### > delete account
```
$ cash-by-hash delete <ACCOUNT_NAME>
```
### > restore account
```
// marker is crypted key for restore your account
// !!! SAVE YOUR MARKER IN THE SECURITY PLACE !!! (like your notebook)

//restore account by marker
$ cash-by-hash restore <YOUR_MARKER> --network BTCTEST

//you can also restore account to another network
$ cash-by-hash restore <YOUR_MARKER> --network BTCMAIN

//view the account's marker
$ cash-by-hash marker <ACCOUNT_NAME>

```
### > more about...
```
$ cash-by-hash <COMMAND> --help
```

---

## Parting words

* This is the beta version of the bitcoin cli wallet. 
* You can create an account, find/remove an account by name, or use a "marker". 
* By default, it works on the test network (BTCTEST).
* You are free to test this application. 
* Be careful if you work in the main network! Only you are responsible for your funds!

---

## FAQ

- **Q:** How to create an address on the main bitcoin network?

    **A:** -> ```$ cash-by-hash --help```

- **Q:** How to see your private key?
    
    **A:** -> ```$ cash-by-hash --help```

- **Q:** Marker?
    
    **A:** This is a special encoded string. With it, you can restore your account.

---

## Epilog

**In God We Trust.**

