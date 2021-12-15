//crypto functions
//
const crypto = require('crypto');
const md5sh = require('md5');

//aes
const algorithm = 'aes-256-ctr';

//encrypt by aes algorithm
const Encrypt = (text, password) => {

	//init vector
	const iv = Buffer.from(md5sh(password), 'hex');
	
	//get cipher object
	const cipher = crypto.createCipheriv(algorithm, password, iv);

	//calc encrypted string
	const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

	//return string
	return encrypted.toString('hex');

}

//decrypt by aes algorithm
const Decrypt = (text, password) => {

	//init vector
	const iv = Buffer.from(md5sh(password), 'hex');

	//decipher object
	const decipher = crypto.createDecipheriv(algorithm, password, iv);

	//calc decrypted string
	const decrypted = Buffer.concat([decipher.update(text, 'hex'), decipher.final()]);

	//return buffer
	return decrypted;
}

//get sha256 hash
const Hash256 = (text) => {

	//sha init
	const sha256 = crypto.createHash('sha256');

	//update data
	sha256.update(text);

	//calc and return buffer
	return sha256.digest('hex');
}

//export module
module.exports = {Encrypt, Decrypt, Hash256};