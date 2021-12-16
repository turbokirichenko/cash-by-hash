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
	//if file not 
	if(!fs.existsSync(initfile)) {
		console.log(colors.red('there is no account directory'));
		return Promise.resolve({status: false, code: 27});
	}
	user.RawModeTrue();
	const data_object = await ObtainUserData(initfile, fullname);
	if(!data_object.status) return data_object;
	if (marker.ControlPassword(data_object.p_b, data_object.p_t.prefix, data_object.p_t.body, data_object.p_t.network)) {
		try {
			//get seckey
			const seckey = marker.GetSecKey(data_object.p_b, data_object.p_t.body);
			const infobj = btcnet.WalletInfo(data_object.p_t.network, seckey);
			const balanceInfo = await bitcoinAPI.AccountInfo(infobj.address, data_object.p_t.network);
			if(!balanceInfo) {
				console.log('/ aborted... ');
				return Promise.resolve({status: false, code: 11});
			}
			//
			if(value) value = value.replace(',','.');
			if(fees) fees = fees.replace(',', '.');
			const trxStuff = {
				value: value,
				fee: fees,
				utxo: balanceInfo.utxo,
				network: data_object.p_t.network,
				ext: addrs,
			}
			const res = await user.ScanSendValue(balanceInfo.amount, trxStuff.value, trxStuff.fee);
			if (!res) {
				console.log('/ aborted... ');
				return Promise.resolve({status: false, code: 14})
			}
			trxStuff.value = res.valueNum;
			trxStuff.fee = res.feeNum;
			if(trxStuff.value < 10000.) {
				console.log(colors.red('The value is too small:  < 0.0001 BTC'));
				console.log('/ aborted... ');
				return Promise.resolve({status: false, code: 14})
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
				const res_txid = await bitcoinAPI.TransactionSend(txRaw.report, data_object.p_t.network);
				if(!res_txid) {
					console.log(colors.red('error with network!'));
					return Promise.resolve({status: false, code: 17});
				}
				console.log(colors.yellow('#----------$ TX STATUS $----------#'));
				console.log(colors.yellow('# txid: ') + res_txid);
				console.log(colors.yellow('#'));
				console.log(colors.grey('see the details on the website: https://blockstream.info/'));
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