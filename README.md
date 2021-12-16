# CaSh By HaSh [alpha]
a node cli bitcoin wallet (testnet | mainnet)

![alt text](https://img.shields.io/badge/bitcoin-wallet-yellow|"none")
![alt text](https://img.shields.io/badge/btc%20test-mvwWrWtiToK6RJ1iyQh1EgQpWgJwV2NgVv-brightgreen?style=plastic|"none")
![alt text](https://img.shields.io/github/watchers/turbokirichenko/cash-by-hash?style=plastic|"none")
---

## Prologue

A good thing to get to know the bitcoin network better.

---

## Base

### > intall wallet
$ **npm** install -g cash-by-hash 
### > add account
$ **cash-by-hash** addacc [__account_name__] 
### > account status 1
$ **cash-by-hash** getacc [__account_name__] --balance --keyless
### > account status 2
$ **cash-by-hash** amount <__bitcoin_address__>
### > broadcast transaction
$ **cash-by-hash** transferto <__bitcoin_address__> --from <__account_name__> --value <__number__>
### > remove account
$ **cash-by-hash** rmvacc [__account_name__] --report
### > more detailed...
$ **cash-by-hash** --help

---

## Parting words

@ This is the alpha version of the bitcoin cli wallet. 
@ You can create an account, find/remove an account by name, or use a "marker". 
@ By default, it works on the test network (BTCTEST). 
@ You are free to test this application. 
@ Be careful if you work in the main network! Only you are responsible for your funds!

---

## FAQ

### **Q:** How to create an address on the main bitcoin network?
**A:** -> $ **cash-by-hash** --help

### **Q:** How to see your private key?
**A:** -> $ **cash-by-hash** --help

### **Q:** Marker?
**A:** This is a special encoded string. With it, you can make transactions on wallet faster and more secure.

---

## Epilog

**In God We Trust.**