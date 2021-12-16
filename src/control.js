//3 level
//get marker from list
const fs = require('fs');
const md5 = require('md5');
const crypto = require('crypto');
const colors = require('colors');
const bitcoinAPI = require('./btc/btc.js');
const btcnet = require('./components/btcnet');
const user = require('./components/user-interface');
const marker = require('./components/marker-interface');
const registry = require('./components/registry-interface');
//
const ControlMarker = async (initfile, fullname) => {
	//if file not 
	if(!fs.existsSync(initfile)) {
		console.log(colors.red('there is no account directory'));
		return Promise.resolve({status: false, code: 27});
	}
	//input new password and confirm
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
		console.log(colors.red('WARNING the password is incorrect or data has been changed!'));
		console.log('/ aborted... ');
		return Promise.resolve({status: false, code: 20});
	}
	console.log(colors.green('success'));
	//
	return Promise.resolve({status: true, code: 0});
}
module.exports = { ControlMarker };