//3 level
//interface for create account
const md5 = require('md5');
const crypto = require('crypto');
const colors = require('colors');
const btcnet = require('./components/btcnet')
const user = require('./components/user-interface');
const marker = require('./components/marker-interface');
const registry = require('./components/registry-interface');

//create new account
AddAccInterface = async (initfile, fullname = null, network = 'BTCTEST', approval = true, segwit = false) => {
	user.RawModeTrue();
	console.log(colors.gray('# [left ctrl + c]: exit'));
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
	const nametag = registry.GenNameTag(fullname, token, pwd_hash);
	//console out
	console.log(colors.gray(`#---------$ ${network} NETWORK $----------#`));
	console.log(colors.gray('#'));
	console.log(colors.gray('# acc name: ') + fullname);
	console.log(colors.gray('# address : ') + infobj.address);
	if(approval)console.log(colors.gray('# private*: ') + colors.grey(infobj.seckey.toString('hex')));
	console.log(colors.gray('# marker**: ') + token);
	console.log(colors.gray('#'));
	if(approval)console.log(colors.red('* DO NOT GIVE THE PRIVATE KEY TO ANYONE!!!                        '));
	console.log(colors.red('** The MARKER is needed to make transaction. DO NOT LOSE it!!!    \n'));
	//answer
	const answered = await user.ExpectationAnswer('/ Confirm? (y/n): ')
	if(!answered){
		return Promise.resolve({status: false, code: 7});
	}
	//
	console.log(colors.green('write data... (hash: ' + md5(token).substr(0,5) + ')'));
	const write = await registry.WriteRegLine(initfile, nametag + token);
	if(!write) {
		return Promise.resolve({status: false, code: 11});
	}
	return Promise.resolve({status: true, code: 0});
}

module.exports = { AddAccInterface };
