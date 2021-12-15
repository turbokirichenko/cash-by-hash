//
const testing = require('./eq');
const op = require('./../src/components/btcnet');
const btc = require('bitcoinjs-lib');
const { ECPair } = require('ecpair');
//
it('search network', function () {
	const result_one = op.NetMode('MaInBTc');
	const result_two = op.NetMode('BTCTEST');
	const result_three = op.NetMode('BTCMAIN');

	testing.eq(result_one, false);
	testing.eq(result_two, btc.networks.testnet);
	testing.eq(result_three, btc.networks.mainnet);
});
//
it('get info by seckey', function () {
	const result_one = op.WalletInfo('BtCtTtT');
	const result_two = op.WalletInfo('BTCTEST', Buffer.from("f52428f3ecb9a2a0ee43c073c110152def0a36a2a2667adccf2b616f624bde63", 'hex'));

	testing.eq(result_one, false);
	testing.eq_string(result_two.address, 'mnQsJSJMcHuLMLJCPNnUBwqQ4RhtfsWLnL');
	testing.eq_string(result_two.seckey.toString('hex'), "f52428f3ecb9a2a0ee43c073c110152def0a36a2a2667adccf2b616f624bde63");
});