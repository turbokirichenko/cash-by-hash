//
const testing = require('./eq');
const bs58check = require('bs58check');
const op = require('./../src/components/marker-interface');
//
it('testing default marker', function() {
	const password = 'e0f78514441ff57fe0546c1591396f847a1d78ca09a30e9396a8865848535092';
	const seckey = 'ff0b43b2832905149a9bd05b9b3e57a75b10d54fe4f221c7cbeec1d4df3d7800';
	const result = op.GenMarker(Buffer.from(password, 'hex'), Buffer.from(seckey, 'hex'));
	testing.eq_string(result, '2uT5PdZdCaamDKGgBCQazUcg5WFWwhWe3h67knVpr2RRfpx2PVofwJh6yN');
});
it('extract network', function () {
	const dec_marker = bs58check.decode('2uT5PdZdCaamDKGgBCQazUcg5WFWwhWe3h67knVpr2RRfpx2PVofwJh6yN').toString('hex');
	const result = op.ExtractNetwork(dec_marker.substr(dec_marker.length - 4, 4));
	testing.eq_string(result, 'BTCTEST');
});
it('extract partition', function () {
	const marker = '2uT5PdZdCaamDKGgBCQazUcg5WFWwhWe3h67knVpr2RRfpx2PVofwJh6yN';
	const dec_marker = bs58check.decode(marker).toString('hex');
	const body = 'acd9188362c70d128fae53786967998cad89826add61930846139f8ec801acfc22cc';
	const result = op.ExtractMarkerPartition(marker);
	testing.eq_string(result.body, body);
});
it('control password', function () {
	const prefix = '721a1a8e';
	const body = 'acd9188362c70d128fae53786967998cad89826add61930846139f8ec801acfc22cc';
	const password = 'e0f78514441ff57fe0546c1591396f847a1d78ca09a30e9396a8865848535092';
	const result_one = op.ControlPassword(Buffer.from(password, 'hex'), prefix, body, 'BTCMAIN');
	const result_two = op.ControlPassword(Buffer.from(password, 'hex'), prefix, body, 'BTCTEST');
	testing.eq(result_one, false);
	testing.eq(result_two, true);
});
it('get sec key', function () {
	const password = 'e0f78514441ff57fe0546c1591396f847a1d78ca09a30e9396a8865848535092';
	const body = 'acd9188362c70d128fae53786967998cad89826add61930846139f8ec801acfc22cc';
	const seckey = 'ff0b43b2832905149a9bd05b9b3e57a75b10d54fe4f221c7cbeec1d4df3d7800';
	const result = op.GetSecKey(Buffer.from(password, 'hex'), body);
	testing.eq_string(result.toString('hex'), seckey);
});