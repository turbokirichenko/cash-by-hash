const crypto = require('crypto');
const md5 = require('md5');
const colors = require('colors');
//user input
//
const RawModeTrue = () => {
	process.stdin.setRawMode(true);
}
//
const RawModeFalse = () => {
	process.stdin.setRawMode(false);
}
// 
const OnceButton = (encoding = 'utf8') => {
	//start sdtin and encoding
	process.stdin.resume();
	process.stdin.setEncoding(encoding);
	//promise need
	return new Promise((resolve, reject) => {
		//input symbol
		process.stdin.once('data', c=> {
			//backspace
			if(c.charCodeAt(0) == 8 || c.charCodeAt(0) == 127) {
				process.stdin.pause();
				resolve('BACK');
			}
			//enter
			if(c.charCodeAt(0) == 13) {
				process.stdin.pause();
				resolve('SIGN');
			}
			//esc
			if(c.charCodeAt(0) == 27 || c.charCodeAt(0) == 3){
				process.stdin.pause();
				resolve('EXIT');
			}
			else {
				process.stdin.pause();
				resolve(c);
			}
		});
	});
}
//
const ScanPhrase = async (message, opt) => {
	process.stdout.write(message);
	//max word length
	let long = opt.long || 16;
	let word = '';
	while (long) {
		try {
			//
			const ch = await OnceButton();

			//
			switch(ch){
				case "EXIT":
					return Promise.resolve({status: false, report: 'exit'});
				case "SIGN":
					return Promise.resolve({status: word, report: 'signed'});
				case "BACK":
					return Promise.resolve({status: false, report: 'exit'});
				default:
					if(opt.visible) process.stdout.write(ch);
					word = word + ch;
			}
			if(opt.visible) opt.visible = opt.visible*1 - 1;
			--long;
		}
		catch (err) {
			//catching new error
			return Promise.reject(err);
		}
	}
	return Promise.resolve({status: false, report: 'maxlen', meta: word});
}
//user input
const ShrederLine = async (message, opt) => {
	process.stdout.write(message);
	//meta data
	let long = opt.long || 64;
	let data = opt.salt ? md5(opt.salt).substr(0, 8) : '12345678';
	let cap = 0;
	//get sha hash of word
	const sha256 = crypto.createHash('sha256');
	while (long) {
		try {
			//refresh
			const ch = await OnceButton();
			if((/[!@#$%^&*_]*/g).test(ch)) cap+=2;
			if((/[0-9]*/g).test(ch)) cap++;
			//check by collision
			switch (ch) {
				case "EXIT":
					return Promise.resolve({status: false, report: 'exit'});
				case "SIGN":
					cap = cap / 8;
					cap += (opt.long - long) / 10;
					let message = colors.grey('LOW protection');
					if(cap > 6) message = colors.yellow('MIDDLE protection');
					if(cap > 12) message = colors.green('HIGH protection');
					sha256.update(data);
					return Promise.resolve({status: sha256.digest(), report: message});
				case "BACK":
					return Promise.resolve({status: false, report: 'exit'});
				default:
					const lockStr = md5(ch + data + ch);
					data = md5(lockStr + data.substr(0, data.length/2));
			} 
			--long;
		}
		catch (err) {
			//catching error
			return Promise.reject(err);
		}
	}
	return Promise.resolve({status: false, report: 'maxlen'});
}
//input account name DEPRECATED!!!
const ScanAccName = async (opt) => {
	//meta
	RawModeTrue();
	let statusObj = null;
	let maxLong =  16;
	do {
		try {
			statusObj = await ScanPhrase('/ accout name (max len ' +maxLong+'): ', {long: maxLong, visible: maxLong});
			if(statusObj.status) process.stdout.write('\n');
			else process.stdout.write(' interrupted\n');
			if(statusObj.status === false) {
				if(statusObj.report === 'maxlen'){
					console.log(colors.red('maximum length ('+maxLong+') exceeded'));
					statusObj = null;
				}
				else if(statusObj.report === 'exit'){
					return Promise.resolve(false);
				}
				statusObj = null;
			}
		}
		catch (err) {
			//catching error
			throw new Error(err);
		}
	} while (!statusObj);
	return Promise.resolve(statusObj.status);
}
//input account name v2.0 (with false raw mode)
const ScanAccountName = async (long) => {
	//set raw mode to false state
	RawModeFalse();
	//output message
	process.stdout.write('/ account name (max len ' + long + '): ');
	//begin user input
	process.stdin.resume();
	const userInputPromise = () => {
		return new Promise((resolve, reject) => {
			process.stdin.on('data', data => {
				process.stdin.setEncoding('utf8');
				resolve(data.toString());
				//end input
				process.stdin.pause();
			})
			process.stdin.on('error', err => {
				reject(err);
			})
		});
	}
	//get account name from promise
	const accountName = await userInputPromise();
	let wordlong = 0;
	//check len of name and return result data
	return long < (wordlong = (accountName.length - 1))
		? colors.red("max long for account name is: " + long + "!!! Yours: " + wordlong +"!") 
		: accountName.substr(0, wordlong);
}
//input address (with regex checking)
const ScanAddress = async (network) => {
	//set raw mode to false state
	RawModeFalse();
	//regex for this network
	let regexcoin = '';
	switch (network) {
		case 'BTCTEST' : 
			regexcoin = /^(?:[mn]{1}[a-km-zA-HJ-NP-Z1-9]{26,33}|tb1[a-z0-9]{39,59})$/g;
			break;
		case 'BTCMAIN' :
			regexcoin = /^(?:[13]{1}[a-km-zA-HJ-NP-Z1-9]{26,33}|bc1[a-z0-9]{39,59})$/g;
			break;
	}
	//output message
	process.stdout.write("/ recipient's address: ");
	//begin user input
	process.stdin.resume();
	const userInputPromise = () => {
		return new Promise((resolve, reject) => {
			process.stdin.on('data', data => {
				process.stdin.setEncoding('utf8');
				resolve(data.toString());
				//end input
				process.stdin.pause();
			})
			process.stdin.on('error', err => {
				reject(err);
			})
		});
	}
	//get account name from promise
	const address = await userInputPromise();
	let wordlong = 0;
	//check address with regex
	const res = regexcoin.test(address.substr(0, address.length - 1))
		? address.substr(0, address.length - 1)
		: null;
	//error message
	if(!res) console.log(colors.red("wrong "+network+" address!!!"));
	return res;
}
//input marker
const ScanAccountMarker = async (opt) => {
	//meta
	RawModeTrue();
	let statusObj = null;
	let maxLong = 64;
	let maxVisb = 16;
	do {
		try {
			statusObj = await ScanPhrase('/ marker: ', {long: maxLong, visible: maxVisb});
			if(statusObj.status) process.stdout.write(' (hash: ' + md5(statusObj.status).substr(0,5) + ')\n');
			else process.stdout.write('\n');
			if(statusObj.status === false) {
				if(statusObj.report === 'maxlen'){
					console.log(colors.red('maximum length ('+maxLong+') exceeded'));
				}
				else if(statusObj.report === 'exit'){
					return Promise.resolve(false);
				}
				statusObj = null;
			}
		}
		catch (err) {
			//catching error
			throw new Error(err);
		}
	} while (!statusObj);
	return Promise.resolve(statusObj.status);
}
//input password
const ScanAccountPassword = async (opt) => {
	//meta data
	RawModeTrue();
	let statusObj = null;
	let maxLong = 64;
	let salt = '12345678';
	do {
		try {
			statusObj = await ShrederLine('/ password: ', {long: maxLong, salt: salt});
			if(statusObj.status === false) {
				if(statusObj.report === 'maxlen'){
					console.log(colors.red('\nmaximum length ('+maxLong+') exceeded'));
					statusObj = null;
				}
				if(statusObj.report === 'exit'){
					console.log('');
					return Promise.resolve(false);
				}
				statusObj = null;
			}
		}
		catch (err) {
			throw new Error(err);
		}
	} while (!statusObj);
	process.stdout.write(' SIGNED\n');
	return Promise.resolve(statusObj.status);
}
//input password for new account
const ScanAndSubmitPassword = async (opt) => {
	//meta data
	RawModeTrue();
	let statusObj_one = null;
	let statusObj_two = null;
	let maxLong = 64;
	let salt = '12345678';
	do {
		try {
			//new password
			statusObj_one = await ShrederLine('/ new password: ', {long: maxLong, salt: salt});
			if(statusObj_one.status) process.stdout.write(' ' + statusObj_one.report + '\n');
			else process.stdout.write(' interrupted\n');
			if(statusObj_one.status === false) {
				if(statusObj_one.report === 'maxlen'){
					console.log(colors.red('maximum length ('+maxLong+') exceeded'));
					statusObj_one = null;
					continue;
				}
				if(statusObj_one.report === 'exit'){
					return Promise.resolve(false);
				}
				console.log('something went wrong :(');
				statusObj_one = null;
				continue;
			}
			//repeat password
			statusObj_two = await ShrederLine('/ confirm password: ', {long: maxLong, salt: salt});
			if(statusObj_two.status) process.stdout.write(' ' + statusObj_two.report + '\n');
			else process.stdout.write(' interrupted\n');
			if(statusObj_one.status.toString() != statusObj_two.status.toString()) {
				if(statusObj_two.report === 'exit'){
					return Promise.resolve(false);
				}
				console.log(colors.red('passwords do not match'));
				statusObj_two = null;
				continue;
			}
		}
		catch (err) {
			//catching error
			throw new Error(err);
		}
	} while (!statusObj_two || statusObj_one.status.toString('hex') != statusObj_two.status.toString('hex'));
	return Promise.resolve(statusObj_two.status);
}
//expect answer from user
const ExpectationAnswer = async (question, success = 'y', failed = 'n', update = 'u') => {
	//answer data
	RawModeTrue();
	let answer = null;
	do {
		try{
			answer = await ScanPhrase(question, {long: 1, visible: 0});
			if(answer.status === false) {
				if(answer.report == 'exit') {
					console.log(' interrupted');
					return Promise.resolve(false);
				}
				if(answer.report == 'maxlen') {
					if(answer.meta == success) {
						console.log('true');
						return Promise.resolve(true);
					}
					if(answer.meta == failed) {
						console.log('false');
						return Promise.resolve(false);
					}
					if(answer.meta == update) {
						console.log('load new result...');
						answer = null;
						continue;
					}
				}
				answer = null
				console.log('unrecognized');
				continue;
			}
			else {
				answer = null;
				console.log('unrecognized');
				continue;
			}
		}
		catch(err) {
			//catching errorw
			throw new Error(err);
		}
	} while(!answer);
}
//
const ParseBitcoin = (x) => {
	const parsed = parseFloat(x, 10);
	if(isNaN(parsed)) {return false;}
	return parsed;
}
const ScanSendValue = async (amnt = false, approvalValue = false, approvalFee = false) => {
	//amnt - satoshi, approval - BTC 
	RawModeTrue();
	const amount = amnt/100000000. || null;
	let value = null;
	let fees = approvalFee || 2700/100000000.;
	//check balance
	if(amount - fees < 0.0001) {
		console.log(colors.red('the balance is too low!'));
		return Promise.resolve(false);
	}
	do {
		try {
			//
			feeConfirmed = approvalFee || await ExpectationAnswer('/ current fee: '+ fees +' tBTC, confirned? (y/n): ');
			if(feeConfirmed === false) {
				console.log(colors.grey('refusal'));
				return Promise.resolve(false);
			}
			else {
				//
				if(!approvalFee) console.log(colors.green('accepted'));
			}
			//
			const message = amnt ? '/ value tBTC (max ' + (amount - fees).toString().substr(0, 8) + '): ' : '/ value tBTC: ';
			if(approvalValue) value = {status: approvalValue}			
			else value = await ScanPhrase(message, {long: 16, visible: 16});
			if(value.status){ 
				value.status = value.status.replace(',', '.');
				value.status = ParseBitcoin(value.status); 
				if(!approvalValue) 
					process.stdout.write('\n'); 
			}
			else process.stdout.write(' interrupted\n');
			if(value.status === false) {
				if(value.report === 'maxlen'){
					console.log(colors.red('maximum length (16) exceeded'));
					value = null;
				}
				else if(value.report === 'exit'){
					console.log(colors.grey('refusal'));
					return Promise.resolve(false);
				}
				console.log(colors.grey('refusal'));
				value = null;
			}
		}
		catch (err) {
			//
			throw new Error(err);
		}
	} while (!value);
	//return in satoshi
	return Promise.resolve({valueNum: value.status*100000000, feeNum: fees*100000000});
}

const ScanValue = async (approval, more = false) => {
	RawModeFalse();
	//console message
	process.stdout.write(colors.grey('# available: ' + approval.toFixed(8).replace(/0+$/,'') + ' (' + (more ? more : '') + ')\n'));
	process.stdout.write('/ value: ');
	
	//gen promise
	//begin user input
	process.stdin.resume();
	const userInputPromise = () => {
		return new Promise((resolve, reject) => {
			process.stdin.on('data', data => {
				process.stdin.setEncoding('utf8');
				resolve(data.toString());
				//end input
				process.stdin.pause();
			})
			process.stdin.on('error', err => {
				reject(err);
			})
		});
	}
	
	//get account name from promise
	const value = await userInputPromise();
	const result =  (value.replace(',', '.')*1 > approval*1) ? null : value.replace(',', '.')*1;
	if(result == null) console.log(colors.red('Your value more than you may to send!!!'));

	return result;
}

module.exports = { 
	RawModeTrue,
	OnceButton,
	ScanPhrase,
	ShrederLine,
	ScanAccountName,
	ScanAddress,
	ScanAccountMarker,
	ScanAccountPassword,
	ScanAndSubmitPassword,
	ExpectationAnswer,
	ScanSendValue,
	ScanValue,
}
