# CaSh By HaSh
a node cli bitcoin wallet

### intall wallet
[1]$ npm install -g cash-by-hash 
### add account
[2]$ cash-by-hash addacc [__account_name__] 
### account status 1
[3]$ cash-by-hash getacc [__account_name__] --balance --keyless
### account status 2
[3]$ cash-by-hash amount <bitcoin_address>
### broadcast transaction
[4]$ cash-by-hash transferto <bitcoin_address> --from <account_name> --value <number>
### more detailed...
[5]$ cash-by-hash --help