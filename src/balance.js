//3 level
//get information of wallet balance
const md5 = require('md5');
const crypto = require('crypto');
const colors = require('colors');
const bitcoinAPI = require('./btc/btc.js');
const btcnet = require('./components/btcnet')
const user = require('./components/user-interface');
const marker = require('./components/marker-interface');
const registry = require('./components/registry-interface');
//
const AddressBalance = async (addr, net = 'BTCTEST') => {
	try {
		const balanceInfo = await bitcoinAPI.AccountInfo(addr, net);
		if (!balanceInfo) {
			return Promise.resolve({status: false, code: 11});
		}
		console.log(colors.yellow('# amount: ') + balanceInfo.amount / 100000000 + ' BTC');
		balanceInfo.utxo.forEach(txn => {
			console.log(colors.grey('txid: ' + txn.txid));
		});

		//
		return Promise.resolve({status: true, code: 0});
	}
	catch (err) {
		return Promise.reject(err);
	}
}
module.exports = {
	AddressBalance,
}