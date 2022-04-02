//
const bs58check = require('bs58check');
const base64 = require('base-64');
const yenc = require('simple-yenc');
const md5 = require('md5');
const { Encrypt, Decrypt, Hash256 } = require('./../endcrypt');
//marker generating
const GenMarker = (password_buf, seckey, network = 'BTCTEST', version = '72') => {
	//encoding
	try {
		const pwdkey = password_buf.toString('hex');
		const postfix = md5(network).substr(2, 4);
		const encstr = Encrypt(seckey, pwdkey.substr(0, pwdkey.length/2)) + postfix;
		const prefix = version + Hash256(encstr + md5(pwdkey) + network).substr(0,6);
				
		const buf = Buffer.from(prefix + encstr, 'hex');
		return buf.toString('base64');
	}
	catch (err) {
		//
		throw new Error(err);
	}
}
//extract network by postfix hash
const ExtractNetwork = (nethash) => {
	//network names array
	const networkMaster = ['BTCTEST', 'BTCMAIN', 'LTCMAIN', 'DOGEMAIN'];
	const networkLength = 2;
	for (let i = 0; i < networkLength; ++i) {
		if(md5(networkMaster[i]).substr(2,4) == nethash) {
			return networkMaster[i];
		}
	}
	return false;
}

//part marker
const ExtractMarkerPartition = (marker, version = '72') => {
	//decoding
	try {
		const dechex_marker = Buffer.from(marker, 'base64').toString('hex');
		const prefix = dechex_marker.substr(0,8);
		if (prefix.substr(0,2) != version) {
			//versions don't match
			return false;
		}
		const length = dechex_marker.length;
		const network = ExtractNetwork(dechex_marker.substr(length - 4, 4));
		if (!network) {
			//this network is not supported 
			return false;
		}
		//info object
		return {
			prefix: prefix, 
			body: dechex_marker.substr(8, length - 8), 
			network: network
		};
	}
	catch (err) {
		//catching error
		throw new Error(err);
	}
}

//control password on internal collision
const ControlPassword = (pwd_buf, prefix, body, network = 'BTCTEST') => {
	//create answer
	try {
		if(!pwd_buf || !prefix || !body) return false;
		const currentWalletVersion = prefix.substr(0,2);
		const pwdkey = md5(pwd_buf.toString('hex'));
		const answer = currentWalletVersion + Hash256(body + pwdkey + network).substr(0,6);
		//checkout answer
		if (answer === prefix) {
			return true;
		}
		else {
			return false;
		}
	}
	catch (err) {
		//catching error
		throw new Error(err);
	}
}

//get key from marker
const GetSecKey = (pwd_buf, body) => {
	//decrypted
	const pwdkey = pwd_buf.toString('hex');
	try {
		const answer = Decrypt(body.substr(0, body.length - 4), pwdkey.substr(0,pwdkey.length/2));
		return answer;
	}
	catch (err) {
		throw new Error(err);
	}
}

module.exports = {
	GenMarker,
	ExtractNetwork,
	ExtractMarkerPartition,
	ControlPassword,
	GetSecKey
}
