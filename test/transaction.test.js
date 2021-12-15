const testing = require('./eq');
const bitcoinAPI = require('./../src/btc/btc.js');
//internet connection
it('get transaction raw', function (done) {
	const options = {
		value: 100,
		fee: 100,
		network: 'BTCTEST',
		ext: 'mkiHvA3pDCSY8sqjXPebfvDfERCWG1eUTs',
		utxo:[ 
			{
				vout: 1,
				txid: '725038ef37661cf69241b0d53bf81a1f539da60168399f317972c6991144396b',
				status: {
					confirmed: true,
				},
				value: 10000
			}
		],
	};
	const addr = 'mkiHvA3pDCSY8sqjXPebfvDfERCWG1eUTs';
	const pkey = Buffer.from('ff0b43b2832905149a9bd05b9b3e57a75b10d54fe4f221c7cbeec1d4df3d7800', 'hex');
	bitcoinAPI.TransactionRaw(addr, pkey, options).then((result) => {
		testing.eq(result.status, true);
		const testRaw = '02000000016b39441199c67279319f396801a69d531f1af83bd5b04192f61c6637ef385072010000006a47304402207a7d687d5eb0ce61c945c162d2bb735181ff7fc84b0479ebea804b688531ccbc02205e2f9b30876ed849b1e74374cee70cf17d18e699c03049556c08c94f99e223ef012103e72b173afeb50ad9bce878e4b9327688e5cbd3cc850eb725e315a9851a090455ffffffff0248260000000000001976a91438fd95a21ff7b07c5e9be8d72c9086e9afac47d788ac64000000000000001976a91438fd95a21ff7b07c5e9be8d72c9086e9afac47d788ac00000000'
		testing.eq_string(result.report, testRaw);
		done();
	}).catch(err => done(err));
});