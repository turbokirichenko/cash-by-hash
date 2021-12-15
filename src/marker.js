//3 level
//get marker from list
const md5 = require('md5');
const crypto = require('crypto');
const colors = require('colors');
const bitcoinAPI = require('./btc/btc.js');
const btcnet = require('./components/btcnet');
const user = require('./components/user-interface');
const marker = require('./components/marker-interface');
const registry = require('./components/registry-interface');
//
const WalletMarker = async (initfile, fullname) => {
	user.RawModeTrue();
	//read from registry
	const regline = await registry.CheckOverlap(initfile, fullname);
	if(!regline) {
		console.log(colors.red('name not found!'));
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 6});
	}
	//input new password and confirm
	const password_buf = await user.ScanAccountPassword();
	if(!password_buf) {
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 7});
	}
	const pwd_hash = md5(password_buf);
	//extract marker
	const token = registry.ExtractMarker(regline, pwd_hash);
	if(!token) {
		console.log(colors.red('WARNING the password is incorrect!'));
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 20});
	}
	console.log(colors.yellow('\n# Marker*: ') + token);
	console.log(colors.grey('*A more secure way to interact with the account.'));
	console.log(colors.grey('Copy and use instead of the account name!'));
	//
	return Promise.resolve({status: true, code: 0});
}
module.exports = {WalletMarker};