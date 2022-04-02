//
const testing = require('./eq');
const md5 = require('md5');
const bs58check = require('bs58check');
const op = require('./../src/components/registry-interface');
it('testing nametag', function () {
	const marker = 'choajqzZGINixw0Sj65TeGlnmYytiYJq3WGTCEYTn47IAaz8Isw=';
	const password_buf = Buffer.from('e0f78514441ff57fe0546c1591396f847a1d78ca09a30e9396a8865848535092','hex');
	const pwd_hash = md5(password_buf);
	const result = op.GenNameTag('test', marker, pwd_hash);
	const nametag = '<test************0ec83e>';
	testing.eq(result, nametag);
});
it('control registry line', function () {
	const marker = 'choajqzZGINixw0Sj65TeGlnmYytiYJq3WGTCEYTn47IAaz8Isw=';
	const password_buf = Buffer.from('e0f78514441ff57fe0546c1591396f847a1d78ca09a30e9396a8865848535092','hex');
	const pwd_hash = md5(password_buf);
	const nametag = '<test************0ec83e>choajqzZGINixw0Sj65TeGlnmYytiYJq3WGTCEYTn47IAaz8Isw=';
	const result_one = op.ExtractMarker(nametag, pwd_hash);
	testing.eq(result_one.marker, marker);
	const result_two = op.ExtractMarker(nametag, 'test1234test1234');
	testing.eq(result_two.res, false);
});
