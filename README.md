# CaSh By HaSh [Version 1.0.2-alpha]
a node cli bitcoin wallet

---
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
### >more detailed...
$ **cash-by-hash** --help