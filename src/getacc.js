//3 level
//get information of account
const md5 = require('md5');
const crypto = require('crypto');
const colors = require('colors');
const bitcoinAPI = require('./btc/btc.js');
const btcnet = require('./components/btcnet');
const user = require('./components/user-interface');
const marker = require('./components/marker-interface');
const registry = require('./components/registry-interface');
//
const ObtainUserData = async(initfile, fullname = null) => {
	//
	let token = fullname ? null : await user.ScanAccountMarker();
	if(!fullname && !token) {
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 8});
	}
	//input new password and confirm
	const password_buf = await user.ScanAccountPassword();
	if(!password_buf) {
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 7});
	}
	const pwd_hash = md5(password_buf);
	if (fullname) {
		//read from registry
		const regline = await registry.CheckOverlap(initfile, fullname);
		if(!regline) {
			console.log(colors.red('name not found!'));
			console.log('/ aborted... ');
			return Promise.resolve({status: false, code: 6});
		}
		//extract marker
		token = registry.ExtractMarker(regline, pwd_hash);
		if(!token) {
			console.log(colors.red('WARNING the password is incorrect!'));
			console.log('/ aborted... ');
			return Promise.resolve({status: false, code: 20});
		}
	}
	const partition = await marker.ExtractMarkerPartition(token);
	if(!partition) {
		console.log(colors.red('marker not defined!'));
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 9});
	}
	return { status: true, p_b: password_buf, p_t: partition };
}
//
const GetAccInterface = async (initfile, fullname, approval = false, balance = false) => {
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
			let balanceInfo;
			if(balance) {
				balanceInfo = await bitcoinAPI.AccountInfo(infobj.address, data_object.p_t.network);
				if (!balanceInfo) {
					balanceInfo= {amount: 0, utxo: []};
				}
			}
			console.log(colors.yellow('#----------$ Account Info $----------#'));
			console.log(colors.yellow('#'));
			if(fullname) console.log(colors.yellow('# name: ') + fullname);
			console.log(colors.yellow('# address: ') + infobj.address);
			if(balance)console.log(colors.yellow('# amount: ') + balanceInfo.amount / 100000000. + ' tBTC')
			if(approval) console.log(colors.yellow('# private: ') + colors.grey(infobj.seckey.toString('hex')));
			console.log(colors.yellow('#'));
			if(approval)console.log(colors.red('* DO NOT GIVE THE PRIVATE KEY TO ANYONE!!!'));
			if(balance) {
				balanceInfo.utxo.forEach(txn => {
					if(txn) console.log(colors.grey('txid: ' + txn.txid));
				});
			}
			//
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
module.exports = { GetAccInterface, ObtainUserData };