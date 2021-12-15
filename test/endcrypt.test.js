//
const testing = require('./eq');
const op = require('./../src/components/endcrypt');
const md5 = require('md5');
//
it('encrypting string', function () {
	const testing_string = "ABCDEF";
	const key = md5('key');
	const result = op.Encrypt(testing_string, key);
	testing.eq_string(result, '4792fe902a9e');
});
//
it('decrypting string', function () {
	const encrypt_string = '4792fe902a9e';
	const key = md5('key');
	const result = op.Decrypt(encrypt_string, key).toString('utf8');
	testing.eq_string(result, "ABCDEF");
});