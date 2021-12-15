//dep
const btc = require('bitcoinjs-lib');
const { ECPair } = require('ecpair');
//Choise network
const NetMode = (net) => {
	if(net === 'BTCTEST'){
		return btc.networks.testnet;
	}
	if(net === 'BTCMAIN'){
		return btc.networks.mainnet;
	}
	//Incorrect string
	return false;
}
//Generate random key pair
const MakeRandomPair = (obj) => {
	const cpair = ECPair.makeRandom(obj);
	return cpair;
}
//Encoding public key
const MakeAddrByKey = (obj) => {
	const addr = btc.payments.p2pkh(obj);
	return addr;
}
const WalletInfo = (netstr, seckey) => {
	//get network
	const network = NetMode(netstr);
	if(network === false) {
		return false;
	}
	let keyPair = null;
	//get stuff
	if(seckey) keyPair = ECPair.fromPrivateKey(seckey, network);
	else keyPair = MakeRandomPair({network});
	const pbits = MakeAddrByKey({
		pubkey: keyPair.publicKey,
		network: network
	});
	//return info
	return {address: pbits.address, seckey: keyPair.privateKey};
}
module.exports = {NetMode, MakeRandomPair, MakeAddrByKey, WalletInfo};