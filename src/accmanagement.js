const fs = require('fs');
const md5 = require('md5');
const crypto = require('crypto');
const colors = require('colors');
const bitcoinAPI = require('./btc/btc.js');
const btcnet = require('./components/btcnet');
const user = require('./components/user-interface');
const marker = require('./components/marker-interface');
const registry = require('./components/registry-interface');

//get user data from marker
const ObtainUserData = async(initfile, checkname = false, token = false) => {
	//input new password and confirm
	const password_buf = await user.ScanAccountPassword();
	if(!password_buf) {
		console.log('/ aborted... ');
		return {status: false, code: 7};
	}
	const pwd_hash = md5(password_buf);
	if (checkname) {
		//read from registry
		const regline = await registry.CheckOverlap(initfile, checkname);
		if(!regline) {
			console.log(colors.red('name not found!'));
			console.log('/ aborted... ');
			return {status: false, code: 6};
		}
		//extract marker
		token = registry.ExtractMarker(regline, pwd_hash);
		if(!token.res) {
			console.log(colors.red('WARNING! marker has been modified!'));
		}
	}
	if (token) {
		//get part of marker: network, seckey, prefix
		const partition = await marker.ExtractMarkerPartition(token.marker);
		if(!partition) {
			console.log(colors.red('marker not defined!'));
			console.log('/ aborted... ');
			return {status: false, code: 9};
		}
		//return user information
		return { status: true, p_b: password_buf, p_t: partition };
	}
	//return false
	return {status: false, code: 7};
}

//create new account
const AddAcc = async (initfile, fullname = null, network = 'BTCTEST', approval = true) => {
	user.RawModeTrue();
	//input: name, password. check name for unique
	if(!fullname) fullname = await user.ScanAccountName(20);
	if(!fullname) {
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 1});
	}
	const regtest = new RegExp('^[A-Za-z_]\\w+$', 'i');
	if(!regtest.test(fullname)) {
		console.log(colors.red('going beyond the alphabet! (A-Za-z0-9_)'));
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 21});
	}
	const checkname = await registry.CheckOverlap(initfile, fullname);
	if(checkname){
		console.log(colors.red('name not unique!'));
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 2});
	}
	//input new password and confirm
	const password_buf = await user.ScanAndSubmitPassword();
	if(!password_buf) {
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 3});
	}
	//wallet information
	const pwd_hash = md5(password_buf);
	const infobj = btcnet.SpawnWallet(network);
	const token = marker.GenMarker(password_buf, infobj.seckey, network);
	
	//console out
	console.log(colors.gray(`#\n# network : ${network}`));
	console.log(colors.gray('# acc name: ') + fullname);
	console.log(colors.gray('# address : ') + infobj.address);
	if(approval)console.log(colors.gray('# private*: ') + colors.grey(infobj.seckey.toString('hex')));
	console.log(colors.gray('# marker**: ') + token);
	console.log(colors.gray('#'));
	if(approval)console.log(colors.red('* DO NOT GIVE THE PRIVATE KEY TO ANYONE!!!                        '));
	console.log(colors.red('** The MARKER is needed for restore your account. DO NOT LOSE it!!!    \n'));
	//answer
	const answered = await user.ExpectationAnswer('/ Write data to the wallets list? (y/n): ')
	if(!answered){
		return Promise.resolve({status: false, code: 7});
	}
	//
	const nametag = registry.GenNameTag(fullname, token, pwd_hash);
	console.log(colors.green('write data... (hash: ' + md5(nametag + token).substr(0,5) + ')'));
	const write = await registry.WriteRegLine(initfile, nametag + token);
	if(!write) {
		return Promise.resolve({status: false, code: 11});
	}
	return Promise.resolve({status: true, code: 0});
}
//restore account from marker
const Restore = async (initfile, token, network = 'BTCTEST', approval = true) => {
	//input: name, password. check name for unique
	const fullname = await user.ScanAccountName(20);
	if(!fullname) {
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 1});
	}
	const regtest = new RegExp('^[A-Za-z_]\\w+$', 'i');
	if(!regtest.test(fullname)) {
		console.log(colors.red('going beyond the alphabet! (A-Za-z0-9_)'));
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 21});
	}
	const checkname = await registry.CheckOverlap(initfile, fullname);
	if(checkname){
		console.log(colors.red('name not unique!'));
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 2});
	}

	//extract marker partition
	const user_data = await ObtainUserData(initfile, false, {marker: token});
	if(!user_data || !user_data.status) return {status: false, code: 7};
	if(marker.ControlPassword(
		user_data.p_b,
		user_data.p_t.prefix,
		user_data.p_t.body,
		user_data.p_t.network
	)) {
		try {
			//get seckey_buf
			const seckey = marker.GetSecKey(user_data.p_b, user_data.p_t.body);
			if(!seckey) return {status: false, code: 8};
			//get information about wallet
			const infobj = btcnet.WalletInfo(user_data.p_t.network, seckey);
			if(!infobj) return {status: false, code: 9};

			//console account info
			console.log(colors.gray(`#\n# network : ${network}`));
			console.log(colors.gray('# acc name: ') + fullname);
			console.log(colors.gray('# address : ') + infobj.address);
			if(approval)console.log(colors.gray('# private*: ') + colors.grey(infobj.seckey.toString('hex')));
			console.log(colors.gray('# marker**: ') + token);
			console.log(colors.gray('#'));
			if(approval)console.log(colors.red('* DO NOT GIVE THE PRIVATE KEY TO ANYONE!!!'));
			console.log(colors.red('** The MARKER is needed for restore your account. DO NOT LOSE it!!!'));

			//answer
			const answered = await user.ExpectationAnswer('/ Write data to the wallets list? (y/n): ')
			if(!answered){
				return Promise.resolve({status: false, code: 7});
			}
			//
			const nametag = registry.GenNameTag(fullname, token, md5(user_data.p_b));
			console.log(colors.green('write data... (hash: ' + md5(nametag + token).substr(0,5) + ')'));
			const write = await registry.WriteRegLine(initfile, nametag + token);
			if(!write) {
				return Promise.resolve({status: false, code: 11});
			}
			return Promise.resolve({status: true, code: 0});
		}
		catch (err) {
			return Promise.reject(err);
		}
	} else {
		console.log(colors.red('wrong password!'));
		return Promise.resolve({status: false, code: 3});
	}
}
//console private key for account
const OpenKey = async (initfile, name) => {
	//if file not 
	if(!fs.existsSync(initfile)) {
		console.log(colors.red('there is no account directory'));
		return Promise.resolve({status: false, code: 27});
	}
	const user_data = await ObtainUserData(initfile, name);
	if(!user_data || !user_data.status) return {status: false, code: 7};
	if(marker.ControlPassword(
		user_data.p_b,
		user_data.p_t.prefix,
		user_data.p_t.body,
		user_data.p_t.network
	)) {
		try {
			const seckey = marker.GetSecKey(user_data.p_b, user_data.p_t.body);
			if(!seckey) return {status: false, code: 8};
			console.log(colors.gray('#\n# private key: ' + seckey.toString('hex')));
			console.log(colors.gray('#'));
			console.log(colors.red('NOT SEND YOUR PRIVATE KEY TO ANYONE!!!'));
			return Promise.resolve({status: true, code: 0});
		}
		catch (err) {
			return Promise.reject(err);
		}
	} else {
		console.log(colors.red('wrong password!'));
		return Promise.resolve({status: false, code: 3});
	}
}

//delete account from the wallets.list
const Delete = async (initfile, name) => {
	//if file not 
	if(!fs.existsSync(initfile)) {
		console.log(colors.red('there is no account directory'));
		return Promise.resolve({status: false, code: 27});
	}
	//confirm action
	console.log(colors.red('WARNING: ' + `THE ACCOUNT: ${name} WILL BE DELETE!!!`));
	const userAnswer = await user.ExpectationAnswer('/ continue? (y/n): ');
	if (!userAnswer) {
		console.log('/ aborted... ');
		return Promise.resolve({status: true, code: 0});
	}
	
	const user_data = await ObtainUserData(initfile, name);
	if(!user_data || !user_data.status) return {status: false, code: 7};
	if(marker.ControlPassword(
		user_data.p_b,
		user_data.p_t.prefix,
		user_data.p_t.body,
		user_data.p_t.network
	)) {
		try {
			const pwd_hash = md5(user_data.p_b);
			//get regline
			const regline = await registry.CheckOverlap(initfile, name);
			//check password
			const resultMessage = await registry.RemoveLine(initfile, regline, pwd_hash);
			if (!resultMessage) {
				console.log(colors.red('failed to delete!'));
				return Promise.resolve({status: false, code: 19});
			}
			//output a message
			console.log(colors.grey('#\n# marker: ') + resultMessage);
			console.log(colors.gray('#'));
			console.log(colors.red('please, remeber your marker!\n') + colors.green('\ndeleted: (hash: '+ md5(resultMessage).substr(0,5) +')'));
			
			return Promise.resolve({status: true, code: 0});
		}
		catch (err) {
			return Promise.reject(err);
		}
	} else {
		console.log(colors.red('wrong password!'));
		return Promise.resolve({status: false, code: 3});
	}
}

//deposit to account
const Deposit = async (initfile, name) => {
	//if file not 
	if(!fs.existsSync(initfile)) {
		console.log(colors.red('there is no account directory'));
		return Promise.resolve({status: false, code: 27});
	}
	//get user data
	const user_data = await ObtainUserData(initfile, name);
	if(!user_data || !user_data.status) return {status: false, code: 7};
	if(marker.ControlPassword(
		user_data.p_b,
		user_data.p_t.prefix,
		user_data.p_t.body,
		user_data.p_t.network
	)) {
		try {
			//get seckey_buf
			const seckey = marker.GetSecKey(user_data.p_b, user_data.p_t.body);
			if(!seckey) return {status: false, code: 8};
			//get information about wallet
			const infobj = btcnet.WalletInfo(user_data.p_t.network, seckey);
			if(!infobj) return {status: false, code: 9};
			//console current network
			console.log(colors.grey(`#\n# network: ${user_data.p_t.network}`));
			//console deposit address
			console.log(colors.grey('# address: ') + infobj.address);
			console.log(colors.gray('#'));
			console.log(colors.red(`@ SEND TO THIS ADRESS ONLY FROM ${user_data.p_t.network} NETWORK!`));
			console.log(colors.red('@ BE CAREFUL! CHECK ADDRESS AGAIN AVAINT PAYMENT!'));
			return Promise.resolve({status: true, code: 0});
		}
		catch (err) {
			return Promise.reject(err);
		}
	} else {
		console.log(colors.red('wrong password!'));
		return Promise.resolve({status: false, code: 3});
	}
}

const ConfirmTx = async (address, amount, value, fees, net) => {
	//get value and fee
	if (!value) console.log(colors.grey('# VALUE '))
	const confirmedValue = value 
		? value.replace(',', '.')
		: await user.ScanValue(amount/100000000., net);
	//wrong value -> exit
	if (confirmedValue === 0) {
		
	}
	else if	(!confirmedValue){
		console.error(colors.red('wrong value!'))
		return false;	
	} 

	//get fee
	if (!fees) console.log(colors.grey('# FEE '));
	const currentFee = await bitcoinAPI.GetFees() / 100000000.;
	const recomfee = ('/ transaction fee: ' + currentFee.toString() + ' ('+ net +')\n');
	const userAnswer = 
		await user.ExpectationAnswer(
			recomfee 
			+ colors.red(
				'-> amount: '
				+ (currentFee*1. + confirmedValue*1.)
				+ ', confirm transaction? (y/n): ')
			);
	if (!userAnswer){
		console.log('/ aborted... ');
		return false;
	} 

	//confirmed fees
	const confirmedFees = fees
		? fees.replace(',', '.')
		: currentFee;
	//wrong fees -> exit
	if (!confirmedFees) {
		console.log(colors.red('fees not detected!'))
		return false;
	}

	//create tx info object
	const txinfo = {
		ext: address,
		utxo: '',
		value: confirmedValue * 100000000., //satoshi
		fee: confirmedFees * 100000000., //satoshi
		network: net
	}

	//check amount
	if (txinfo.value + txinfo.fee > amount) {
		console.log(colors.red('The value is more than you have!!!'))
		return false;
	}

	//check value
	if (txinfo.value  < 1000.) {
		console.log(colors.red('The value is too small: < 0.00001 BTC'))
		return false;
	}

	return txinfo;
}

//send btc
const SendFrom = async (initfile, name, address = null, value = null, fees = null) => {
	//if file not 
	if(!fs.existsSync(initfile)) {
		console.log(colors.red('there is no account directory'));
		return Promise.resolve({status: false, code: 27});
	}
	//get user data
	const user_data = await ObtainUserData(initfile, name);
	if(!user_data || !user_data.status) return {status: false, code: 7};
	if(marker.ControlPassword(
		user_data.p_b,
		user_data.p_t.prefix,
		user_data.p_t.body,
		user_data.p_t.network
	)) {
		try {
			//get ext address
			const addr = address ? address : await user.ScanAddress(user_data.p_t.network);
			if(!addr) return {status: false, code: 6};
			//get seckey_buf
			const seckey = marker.GetSecKey(user_data.p_b, user_data.p_t.body);
			if(!seckey) return {status: false, code: 8};
			//get information about wallet
			const infobj = btcnet.WalletInfo(user_data.p_t.network, seckey);
			if(!infobj) return {status: false, code: 9};
			//get information about balance
			const balance = await bitcoinAPI.AccountInfo(infobj.address, user_data.p_t.network);
			if (!balance) return {status: false, code: 10};
			//get tx stuff
			const txstuff = await ConfirmTx(addr, balance.amount, value, fees, user_data.p_t.network);
			if (!txstuff) return {status: false, code: 12};
			txstuff.utxo = balance.utxo;

			//get tx raw
			//
			const txRaw = await bitcoinAPI.TransactionRaw(infobj.address, seckey, txstuff);
			if(!txRaw.status) {
				console.log(colors.red('wrong params!'));
				console.log('/ aborted... ');
				return Promise.resolve({status: false, code: 15});
			}

			//broadcast transaction raw
			//
			const res_txid = await bitcoinAPI.TransactionSend(txRaw.report, user_data.p_t.network);
			if(!res_txid) {
				console.log(colors.red('error with network!'));
				return Promise.resolve({status: false, code: 17});
			}
			console.log(colors.green('success! txid: ' + res_txid));
			console.log(colors.grey('# see the details on the website >>> https://blockstream.info/'));
			
			return Promise.resolve({status: true, code: 0});
		}
		catch (err) {
			return Promise.reject(err);
		}
	} else {
		console.log(colors.red('wrong password!'));
		return Promise.resolve({status: false, code: 3});
	}
	
}

const Balance = async (initfile, name) => {
	//if file not 
	if(!fs.existsSync(initfile)) {
		console.log(colors.red('there is no account directory'));
		return Promise.resolve({status: false, code: 27});
	}
	//get user data
	const user_data = await ObtainUserData(initfile, name);
	if(!user_data || !user_data.status) return {status: false, code: 7};
	if(marker.ControlPassword(
		user_data.p_b,
		user_data.p_t.prefix,
		user_data.p_t.body,
		user_data.p_t.network
	)) {
		try {
			//get seckey_buf
			const seckey = marker.GetSecKey(user_data.p_b, user_data.p_t.body);
			if(!seckey) return {status: false, code: 8};
			//get information about wallet
			const infobj = btcnet.WalletInfo(user_data.p_t.network, seckey);
			if(!infobj) return {status: false, code: 9};
			//get balance info
			const balance = await bitcoinAPI.AccountInfo(infobj.address, user_data.p_t.network);
			if(!balance) return {status: false, code: 10};
			//console current network
			console.log(colors.grey(`#\n# network: ${user_data.p_t.network}`));
			//console deposit address
			console.log(colors.grey('# address: ') + infobj.address);
			console.log(colors.gray('# amount: ') + balance.amount/100000000. + ' BTC');
			console.log(colors.gray('#'));
			return Promise.resolve({status: true, code: 0});
		}
		catch (err) {
			return Promise.reject(err);
		}
	} else {
		console.log(colors.red('wrong password!'));
		return Promise.resolve({status: false, code: 3});
	}
}
	
module.exports = {
	ObtainUserData,
	AddAcc,
	Restore,
	OpenKey,
	Delete,
	Deposit,
	SendFrom,
	Balance,
}
