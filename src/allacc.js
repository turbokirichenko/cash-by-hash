const fs = require('fs');
const colors = require('colors');
const SearchAllName = (initfile) => {
	let str = '';
	return new Promise((resolve, reject) => {
		const regtest = new RegExp('<([A-Za-z_]\\w+)\\**\\w+>\\w+', 'g');
		try{
			const internal = fs.readFileSync(initfile, 'utf8');
			const match = Array.from(internal.matchAll(regtest));
			if(match) {
				match.forEach((line, indx) => {
					str = str + '\n' + (indx+1) + ') ' +line[1];
				});
				resolve(str);
			}
			else resolve(false);
		}
		catch (err) {
			reject(err);
		}
	});
}
//output all active accounts
const AllAccounts = async (initfile) => {
	try {
		//if file not 
		if(!fs.existsSync(initfile)) {
			console.log(colors.red('there is no account directory'));
			return Promise.resolve({status: false, code: 27});
		}
		str = await SearchAllName(initfile);
		console.log(colors.yellow('#----------$ Accounts $----------#\n') + str);
		return Promise.resolve({status:true, code: 0});
	}
	catch (err) {
		return Promise.reject(err);
	}
}
module.exports = { AllAccounts };