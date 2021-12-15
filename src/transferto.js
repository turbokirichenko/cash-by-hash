//3 level
//get information of account
const md5 = require('md5');
const crypto = require('crypto');
const colors = require('colors');
const bitcoinAPI = require('./btc/btc.js');
const btcnet = require('./components/btcnet')
const user = require('./components/user-interface');
const marker = require('./components/marker-interface');
const registry = require('./components/registry-interface');
const {ObtainUserData} = require('./getacc.js');
//
const TransferToInterface = async (initfile, addrs, fullname = null, value = null, fees = null) => {
	user.RawModeTrue();
	const data_object = await ObtainUserData(initfile, fullname);
	if(!data_object.status) return data_object;
	if (marker.ControlPassword(data_object.p_b, data_object.p_t.prefix, data_object.p_t.body, data_object.p_t.network)) {
		try {
			//get seckey
			const seckey = marker.GetSecKey(data_object.p_b, data_object.p_t.body);
			const infobj = btcnet.WalletInfo(data_object.p_t.network, seckey);
			const balanceInfo = await bitcoinAPI.AccountInfo(infobj.address);
			if(!balanceInfo) {
				console.log('/ aborted... ');
				return Promise.resolve({status: false, code: 11});
			}
			//
			const trxStuff = {
				value: value*1,
				fee: fees*1,
				utxo: balanceInfo.utxo,
				network: data_object.p_t.network,
				ext: addrs,
			}
			if(!value || !fees) {
				const res = await user.ScanSendValue(balanceInfo.amount, trxStuff.value, trxStuff.fee);
				if (!res) {
					console.log('/ aborted... ');
					return Promise.resolve({status: false, code: 14})
				}
				trxStuff.value = res.valueNum;
				trxStuff.fee = res.feeNum;
			}
			//
			const confirmed = await user.ExpectationAnswer('/ confirm transaction? (y/n): ');
			if (confirmed) {
				//
				const txRaw = await bitcoinAPI.TransactionRaw(infobj.address, seckey, trxStuff);
				if(!txRaw.status) {
					console.log(colors.red('wrong params!'));
					console.log('/ aborted... ');
					return Promise.resolve({status: false, code: 15});
				}
				//
				const res_txid = await bitcoinAPI.TransactionSend(txRaw.report);
				if(!res_txid) {
					console.log(colors.red('error with network!'));
					return Promise.resolve({status: false, code: 17});
				}
				console.log(colors.yellow('#----------$ TX STATUS $----------#'));
				console.log(colors.yellow('# txid: ') + res_txid);
				console.log(colors.yellow('#'));
				console.log(colors.grey('see the details on the website: https://blockstream.info/testnet/'));
			}
			else {
				console.log('/ aborted...');
			}
			return Promise.resolve({status: true, code: 0});
		}
		catch (err) {
			//
			return Promise.reject(err);
		}
	}
	else {
		//fail password
		console.log(colors.red('incorrect password!!!'));
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 13});
	}
}	
module.exports = {TransferToInterface};