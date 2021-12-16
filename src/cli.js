#!/usr/bin/env node
const fs = require('fs');
const colors = require('colors');
const commander = require('commander');
const path = require('path');
//interfaces
const { AddAccInterface } = require('./addacc.js');
const { GetAccInterface } = require('./getacc.js');
const { RmvAccInterface } = require('./rmvacc.js');
const { AddressBalance } = require('./balance.js');
const { TransferToInterface } = require('./transferto.js');
const { WalletMarker } = require('./marker.js');
const { ControlMarker } = require('./control.js');
const { AllAccounts } = require('./allacc.js');
//json objects
const pkg = require('./../package.json');
//command module
const CommanderInterface = () => {
	const logo = '  [=$=] CaSh By HaSh [=$=]   [Version 1.0.0 <alpha>]  ';
	console.log(colors.bgYellow.black(logo));
	//
	commander
		.version(pkg.version)
		.description('Bitcoin wallet service');

	commander
		.command('marker <name>')
		.option('--registry <filepath>', 'alternative file path')
		.option('--check', 'checking the integrity of information')
		.description('displays the current account token')
		.action((name, cmd) => {
			//initial file
			const initfile = cmd.registry
				? path.normalize(process.cwd() +'/'+ cmd.registry)
				: path.normalize(__dirname + '/init/wallets.list');
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
		.command('allacc')
		.option('--registry <filepath>', 'alternative file path')
		.description('displays all accounts on the wallet')
		.action((cmd) => {
			//default registry file
			const initfile = cmd.registry
				? path.normalize(process.cwd() +'/'+ cmd.registry)
				: path.normalize(__dirname + '/init/wallets.list');
			AllAccounts(initfile)
				.then(res => {
					//output status
					console.log(colors.grey('code: ' + res.code));
				})
				.catch(err => {
					console.error(err);
				});
		})
	commander
		.command('addacc [name]')
		.option('--registry <filepath>', 'alternative file path')
		.option('--network <network>', 'network selection: BTCTEST | BTCMAIN')
		.option('--keyless', 'does not output secret information')
		.description('adds a new account to the registry')
		.action((name, cmd) => {
			try {
				const ans = fs.existsSync(__dirname + '/init/wallets.list');
				if(!ans) {
					fs.mkdirSync(__dirname + '/init');
					fs.writeFileSync(__dirname + '/init/wallets.list', '---cash-by-hash---\n', 'utf8');
				}
			}
			catch (err) {
				console.error(err);
			}
			//default registry file
			const initfile = cmd.registry
				? path.normalize(process.cwd() +'/'+ cmd.registry)
				: path.normalize(__dirname + '/init/wallets.list');
			//default network
			const network = (cmd.network == 'BTCTEST') || (cmd.network == 'BTCMAIN')
				? cmd.network 
				: 'BTCTEST';
			//check name
			const fullName = name || null;
			//approval output secret information
			const approval = !cmd.keyless;
			//start
			AddAccInterface(initfile, fullName, network, approval)
				.then(res=>{
					if (res.status) {
						//success
						console.log(colors.grey('code: 0'));
					}
					else {
						//report
						console.log(colors.grey('code: ' + res.code));
					}
				})
				.catch(err=>{
					//catching error
					console.error(err);
				});
		});
	commander
		.command('getacc [name]')
		.option('--registry <filepath>', 'alternative file path')
		.option('--keyless', 'does not output secret information')
		.option('--balance', 'displays balance of Wallet')
		.description('displays information about the wallet')
		.action((name, cmd) => {
			//default registry file
			const initfile = cmd.registry
				? path.normalize(process.cwd() +'/'+ cmd.registry)
				: path.normalize(__dirname + '/init/wallets.list');
			//check name
			const fullName = name || null;
			//approval output secret information
			const approval = !cmd.keyless;
			//start
			GetAccInterface(initfile, fullName, approval, cmd.balance)
				.then(res=>{
					if (res.status) {
						//success
						console.log(colors.grey('code: 0'));
					}
					else {
						//report
						console.log(colors.grey('code: ' + res.code));
					}
				})
				.catch(err => {
					//output error
					console.error(err);
				})
		});
	commander
		.command('rmvacc [name]')
		.option('--registry <filepath>', 'alternative file path')
		.option('--report', 'output result message')
		.description('deletes information about the wallet from the registry')
		.action((name, cmd) => {
			//default registry file
			const initfile = cmd.registry
				? path.normalize(process.cwd() +'/'+ cmd.registry)
				: path.normalize(__dirname + '/init/wallets.list');
			const report = cmd.report;
			RmvAccInterface(initfile, name, report)
				.then(res => {
					if (res.status) {
						//success
						console.log(colors.grey('code: 0'));
					}
					else {
						//report
						console.log(colors.grey('code: ' + res.code));
					}
				})
				.catch(err => {

					//output error
					console.error(err);
				})
		});
	commander
		.command('amount <address>')
		.description('account status information')
		.action((address)=>{
			AddressBalance(address).then(res=> {
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
		.command('transferto <address>')
		.option('--from <name>', 'account name')
		.option('--registry <filepath>', 'alternative file path')
		.option('--value <value>', 'value (BTC)')
		.option('--fees <fees>', 'tx fee (BTC)')
		.description('sends the transaction to the network')
		.action((address, cmd) => {
			//default registry file
			const initfile = cmd.registry
				? path.normalize(process.cwd() +'/'+ cmd.registry)
				: path.normalize(__dirname + '/init/wallets.list');
			TransferToInterface(initfile, address, cmd.from, cmd.value, cmd.fees)
				.then(res=>{
					if (res.status) {
						//success
						console.log(colors.grey('code: 0'));
					}
					else {
						//report
						console.log(colors.grey('code: ' + res.code));
					}
				})
				.catch(err=>{
					console.error(err);
				})
		});
	commander.parse(process.argv);
}
CommanderInterface();
module.exports = {CommanderInterface};