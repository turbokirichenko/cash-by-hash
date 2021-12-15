//blockstream api requests
const btc = require('bitcoinjs-lib');
const btcnet = require('./../components/btcnet');
const {ECPair} = require('ecpair');
const {GetUtxo, GetTxRaw, CalcAmount, ReqTxID} = require('./blockstream-api.js')
const {ScanSendValue} = require('./../components/user-interface');
//
const AccountInfo = async (address) => {
	try {
		const ans = await GetUtxo(address);
		if(!ans) {
			return Promise.resolve(false);
		}
		const amount = CalcAmount(ans);
		if(!amount) {
			return Promise.resolve(false);
		}
		return Promise.resolve({utxo: ans, amount: amount});
	} catch (err) {
		return Promise.reject(err);
	}
}
//
const TransactionSend = async (tx_raw) => {
	try {
		const ans = await ReqTxID(tx_raw);
		if(!ans) {
			return Promise.resolve(false);
		}
		return Promise.resolve(ans);
	} catch (err) {
		//
		return Promise.reject(err);
	}
}
//spent money
const TransactionRaw = async (addr, pkey, options) => {
	//meta
	if( !addr || !pkey || !options) {
		return Promise.resolve({status: false, report: 'incorrect input data'});
	}
	const network = btcnet.NetMode(options.network);
	const extaddr = options.ext;
	const privKey = pkey;
	const utxoArr = options.utxo;
	const value = options.value*1;
	const fee = options.fee*1;
	//public + private
	const keyPair = ECPair.fromPrivateKey(privKey, network);
	//new transaction
	const psbt = new btc.Psbt({network: network});
	//tx info
	psbt.setVersion(2);
	psbt.setLocktime(0);
	//add inputs
	let amount = 0;
	for (let i = 0; i < utxoArr.length; ++i) {
		//we have enough money 
		if(value + fee <= amount) {
			break;
		}
		//get raw tx for segscript
		if (!utxoArr[i].status.confirmed) continue;
		let rawTxn = await GetTxRaw(utxoArr[i].txid);
		if (!rawTxn) continue;
		amount += utxoArr[i].value;
		//add input data
		psbt.addInput({
			hash: Buffer.from(utxoArr[i].txid, 'hex').reverse(),
			index: utxoArr[i].vout,
			nonWitnessUtxo: Buffer.from(rawTxn, 'hex')
		});
	}
	//catching false
	if(!amount || value + fee > amount) {
		console.log('amount: ' + amount + ' satoshi', '\nvalue: ' + (value+fee) + ' satoshi');
		//operation lost
		return Promise.resolve({status: false, report: 'failed'});
	}
	//return to wallet
	psbt.addOutput({
		address: addr,
		value: amount - value - fee,
	});
	//sent on the address
	psbt.addOutput({
		address: extaddr,
		value: value,
	});
	//fixed all inputs
	psbt.signAllInputs(keyPair);
	try{
		//endpoint
		psbt.finalizeAllInputs();
		//result
		const rawTx = psbt.extractTransaction().toHex();
		//return promise as answer
		return Promise.resolve({status: true, report: rawTx});
	}
	catch(err) {
		//catching error
		return Promise.reject(err);
	}
}
module.exports = {
	AccountInfo,
	TransactionSend,
	TransactionRaw,
};