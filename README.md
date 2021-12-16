# CaSh By HaSh [Version 1.0.3-alpha]
a node cli bitcoin wallet (testnet | mainnet)

---
##Prologue

A good thing to get to know the bitcoin network better.

---
##Base

### >intall wallet
$ **npm** install -g cash-by-hash 
### >add account
$ **cash-by-hash** addacc [__account_name__] 
### >account status 1
$ **cash-by-hash** getacc [__account_name__] --balance --keyless
### >account status 2
$ **cash-by-hash** amount <__bitcoin_address__>
### >broadcast transaction
$ **cash-by-hash** transferto <__bitcoin_address__> --from <__account_name__> --value <__number__>
### > remove account
$ **cash-by-hash** rmvacc [__account_name__] --report
### >more detailed...
$ **cash-by-hash** --help

---
##Parting words

@ This is the alpha version of the bitcoin cli wallet. 
@ You can create an account, find/remove an account by name, or use a "marker". 
@ By default, it works on the test network (BTCTEST). 
@ You are free to test this application. 
@ Be careful if you work in the main network! Only you are responsible for your funds!

---
##FAQ

### How to create an address on the main bitcoin network?
A: -> $ **cash-by-hash** --help

### How to see your private key?
A: -> $ **cash-by-hash** --help

### Marker?
A: This is a special encoded string. With it, you can make transactions on wallet faster and more secure.

---
##Epilog

###In God We Trust.