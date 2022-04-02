#!/usr/bin/env node
const fs = require('fs');
const colors = require('colors');
const commander = require('commander');
const path = require('path');
//interfaces
const { AddressBalance } = require('./balance.js');
const { WalletMarker } = require('./marker.js');
const { ControlMarker } = require('./control.js');
const { AllAccounts } = require('./allacc.js');
const { AddAcc, Restore, Deposit, Delete, OpenKey, SendFrom, Balance} = require('./accmanagement.js');
//json objects
const pkg = require('./../package.json');
const cbh = require('./../cash-by-hash.json');
//command module

//console exit code
const FormatExitCode = (exit_code) => {
	const res = 'code: ' + exit_code;
	return colors.gray(res);
}

//console process comment
const FormatComment = (comment) => {
	const res = '# ' + comment;
	return colors.grey(res);
}

//console text message
const FormatMessage = (text) => {
	const res = '=> ' + text;
	return res;
}

//console warning
const FormatWarning = (text) => {
	const res = 'w! ' + text;
	return colors.yellow(res);
}

//console error
const FormatError = (errorMessage) => {
	const res = 'Error! ' + errorMessage;
	return colors.red(res);
}


//get file path
const GetInitFilePath = (local, global, full = false, filename = null) => {
	//get initfile path
	let initfilepath = cbh.preferGlobal 
		? (cbh.globalPath || path.normalize(__dirname + '/../'))
		: path.normalize(process.cwd() + '/');
	if (local) {
		initfilepath = path.normalize(process.cwd() + '/');
	}
	if (global) {
		initfilepath = cbh.globalPath || path.normalize(__dirname + '/../');
	}
	//return full path
	return full 
		? path.normalize(initfilepath  + filename)
		: initfilepath;
}

//
const CommanderInterface = () => {
	const logo = '  [=$=] CaSh By HaSh [=$=]  ';
	const version = '  [v'+pkg.version+'-beta]  ';
	console.log(colors.bgCyan.black(logo) + colors.cyan(version));
	//
	commander
		.version(pkg.version)
		.description('Crypto wallet service');

	commander
		.command('init')
		.option('--global', 'initial file from global access')
		.option('--local', 'initial file from current directory')
		.description('create new wallets directory from the your current location.')
		.action((cmd) => {
			//get initfile path
			const initfile = GetInitFilePath(cmd.local, cmd.global, true, '/wallets.list');			
			//check file for exist and create it
			try {
				const ans = fs.existsSync(initfile);
				if(!ans) {
					fs.writeFileSync(initfile, '---cash-by-hash---\n', 'utf8');
					const res = FormatComment('file location: ' + initfile);
					console.log(res);
				}
				else {
					const res = FormatError('file already exist!\nwatch: ' + initfile);
					console.log(res);
				}
			}
			catch (err) {
				//if unix
				if(process.platform != 'win32') {
					const res = FormatError('Try to use sudo permission or change directory location!');
					console.error(res);
				}
				else {
					const res = FormatError('Enter another location of directory!');
					console.error(res);
				}
				console.error(FormatExitCode(1));
			}
			//success
			console.log(FormatExitCode(0));
		});
	commander
		.command('marker <name>')
		.option('--registry <filepath>', 'alternative file path')
		.option('--check', 'checking the integrity of information')
		.description('displays the current account token')
		.action((name, cmd) => {
			//initial file
			const initfile = cmd.registry
				? path.normalize(process.cwd() +'/'+ cmd.registry)
				: path.normalize(__dirname + '/wallets.list');
			//
			if(cmd.check) 
				ControlMarker(initfile, name)
					.then(res => {
						//output status
						console.log(colors.grey('code: ' + res.code));
					})
					.catch(err => {
						console.error(err);
					});
			else 
				WalletMarker(initfile, name)
					.then(res => {
						//output status
						console.log(colors.grey('code: ' + res.code));
					})
					.catch(err => {
						console.error(err);
					});
		});
	commander
		.command('allacc [name]')
		.option('--local', 'search init file local')
		.option('--global', 'search init from global access')
		.description('displays all accounts on the wallet')
		.action((name, cmd) => {
			//get initfile path
			const initfile = GetInitFilePath(cmd.local, cmd.global, true, '/wallets.list');
			//check file for exsisting
			const ans = fs.existsSync(initfile);
			if(!ans) {
				const len1 = FormatError("haven't file wallets.list from the directory");
				console.log(len1);
				const len2 = FormatError("use command 'init' or check your location");
				console.log(len2);
				console.log(FormatExitCode(1));
				return;
			}
			
			//begin
			AllAccounts(initfile)
				.then(res => {
					//output status
					console.log(colors.grey('code: ' + res.code));
				})
				.catch(err => {
					console.error(err);
				});
		});
	commander
		.command('addacc [name]')
		.option('--local', 'search init file local')
		.option('--global', 'search init from global access')
		.option('--network <network>', 'network: BTCTEST or BTCMAIN')
		.option('--keyless', 'does not output secret information')
		.description('adds a new account to the registry')
		.action((name, cmd) => {
			//get initfile path
			const initfile = GetInitFilePath(cmd.local, cmd.global, true, '/wallets.list');
			//default network
			const network = (cmd.network == 'BTCTEST') || (cmd.network == 'BTCMAIN')
				? cmd.network 
				: 'BTCTEST';
			//check name
			const fullName = name || null;
			//approval output secret information
			const approval = !cmd.keyless;
			//adding new account to wallets list
			try {
				//check file for exsisting
				const ans = fs.existsSync(initfile);
				if(!ans) {
					const len1 = FormatError("haven't file wallets.list from the directory");
					console.log(len1);
					const len2 = FormatError("use command 'init' or check your location");
					console.log(len2);
					console.log(FormatExitCode(1));
					return;
				}
			}
			catch (err) {
				console.error(colors.red('e: something went wrong!'));
			}
			//start
			AddAcc(initfile, fullName, network, approval)
				.then(res => console.log(FormatExitCode(res.code)))
				.catch(console.error);
		});
	commander
		.command('restore <marker>')
		.option('--local', 'put account info from local file')
		.option('--global', 'put account info from main file')
		.option('--network <network>', 'network')
		.option('--keyless', 'does not output secret information')
		.description('restore account from marker')
		.action((marker, cmd) => {
			//get initfile path
			const initfile = GetInitFilePath(cmd.local, cmd.global, true, '/wallets.list');
			//default network
			const network = (cmd.network == 'BTCTEST') || (cmd.network == 'BTCMAIN')
				? cmd.network 
				: 'BTCTEST';
			//check name
			if (!marker) {
				console.error(colors.red('input marker please!!!'));
				return;
			}
			//approval output secret information
			const approval = !cmd.keyless;
			//start
			Restore(initfile, marker, network, approval)
				.then(res => console.log(FormatExitCode(res.code)))
				.catch(console.error);
		})
	commander
		.command('deposit <name>')
		.option('--local', 'search init file local')
		.option('--global', 'open global file')
		.description('process close after account get payment')
		.action((name, cmd) => {
			//open wallet.list file
			const initfile = GetInitFilePath(cmd.local, cmd.global, true, '/wallets.list');
			//todo
			if(!name) {
				console.error(FormatError('input the account name!!!'));
				return;
			}
			//console the deposit address
			Deposit(initfile, name)
				.then(res => console.log(FormatExitCode(res.code)))
				.catch(console.error);		
		});
	commander
		.command('openkey <name>')
		.option('--local', '')
		.option('--global', '')
		.description('open private key from account')
		.action((name, cmd) => {
			//open wallet.list file
			const initfile = GetInitFilePath(cmd.local, cmd.global, true, '/wallets.list');
			//todo
			if(!name) {
				console.error(FormatError('input the account name!!!'));
				return;
			}
			//console the deposit address
			OpenKey(initfile, name)
				.then(res => console.log(FormatExitCode(res.code)))
				.catch(console.error);		
		});
	commander
		.command('delete <name>')
		.option('--local', '')
		.option('--global', '')
		.description('delete account from wallets.list')
		.action((name, cmd) => {
			//open wallet.list file
			const initfile = GetInitFilePath(cmd.local, cmd.global, true, '/wallets.list');
			//todo
			if(!name) {
				console.error(FormaError('input the account name!!!'));
				return;
			}
			//delete function
			Delete(initfile, name)
				.then(res => console.log(FormatExitCode(res.code)))
				.catch(console.error);				
		});
	commander
		.command('amount <address>')
		.option('--network <network>', 'select network: BTCTEST (default) | BTCMAIN')
		.description('account status information')
		.action((address, cmd)=>{
			//default network
			const network = (cmd.network == 'BTCTEST') || (cmd.network == 'BTCMAIN')
				? cmd.network 
				: 'BTCTEST';
			AddressBalance(address, network).then(res=> {
				if (res.status) {
					//success
					console.log(colors.grey('code: 0'));
				}
				else {
					//report
					console.log(colors.grey('code: ' + res.code));
				}
			}).catch(err => {
				console.error(err);
			})
		});
	commander
		.command('send-from <account_name>')
		.option('--to <address>', 'btc/btctest address')
		.option('--local')
		.option('--global')
		.option('--value <value>', 'which value you would to pay')
		.option('--fees <fees>', 'current tx fee')
		.description('')
		.action((account_name, cmd) => {
			//open wallet.list file
			const initfile = GetInitFilePath(cmd.local, cmd.global, true, '/wallets.list');
			
			if(!account_name) {
				console.error(colors.red('please, set account name!!!'));
				return;
			}

			const address = cmd.to ? cmd.to : null;
			const value = cmd.value ? cmd.value.replace(',', '.') : null;
			const fees = cmd.fees ? cmd.fees.replace(',', '.') : null;
			//delete function
			SendFrom(initfile, account_name, address, value, fees)
				.then(res => console.log(FormatExitCode(res.code)))
				.catch(console.error);		
		}); 
	commander
		.command('balance <name>')
		.option('--local', '')
		.option('--global', '')
		.description('account balance')
		.action((name, cmd) => {
			//open wallet.list file
			const initfile = GetInitFilePath(cmd.local, cmd.global, true, '/wallets.list');

			//check name
			if(!name) {
				console.error(colors.red('please, input account name!!!'));
				return;
			}
			//
			Balance(initfile, name)
				.then(res => console.log(FormatExitCode(res.code)))
				.catch(console.error);
				
		});
	commander.parse(process.argv);
}
CommanderInterface();
module.exports = {CommanderInterface};
