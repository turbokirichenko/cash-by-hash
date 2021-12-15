//blockstream api requests
const https = require('https');
const request = require('superagent');


//api testnet
const blockstreamAPI = 'https://blockstream.info/testnet/api';
//
const CalcAmount = (utxoArr) => {
	let amount = 0;
	for (let i = 0; i < utxoArr.length; ++i) {
		amount += utxoArr[i].value;
	}
	return amount;
}
//
const ReqUtxo = async (addr) => {
	try {
		const res = new Promise((resolve, reject)=> {
			https.get(blockstreamAPI + '/address/' + addr + '/utxo', (res) => {
				res.setEncoding('utf8');
				let out='';
				res.on('data', (d)=>{
					out = out + d;
				})
				res.on('end', ()=> {
					const result = { status: true, utxo: out.toString(), code: res.statusCode}
					resolve(result);
				})
			})
		});
		//promise 
		return res;
	}
	catch (err) {
		//catching promises error
		return Promise.reject(err);
	}
}
//
const ReqTxRaw = async (tx_id) => {
	try{
		const res = new Promise((resolve, reject) => {
			https.get(blockstreamAPI + '/tx/' + tx_id +'/raw', (res)=>{
				res.setEncoding('hex');
				let out = '';
				res.on('data', (d) => {
					out = out + d;
				});

				res.on('end', () => {
					const result = { status: true, rawhex: out.toString('hex'), code: res.statusCode}					
					resolve(result);
				})
			});
		})
		//promise ok
		return res;
	}
	catch(err) {
		//catching promises error
		return Promise.reject(err);
	}
}
//
const ReqTxID = async (tx_raw) => {
	try {
		const res = await request.post(blockstreamAPI + '/tx').send( tx_raw );
		if(!res || res.statusCode >= 300) return Promise.resolve(false);
		return Promise.resolve(res.text);
	}
	catch (err) {
		return Promise.reject(err);
	}
}
//
const GetUtxo = async (address) => {
	const result = await ReqUtxo(address);
	if(!result.status) return false;
	let utxo = [];
	utxo = Array.from(JSON.parse(result.utxo));
	return utxo;
}
//
const GetTxRaw = async (txid) => {
	const result = await ReqTxRaw(txid);
	if(!result.status) return false;
	return Promise.resolve(result.rawhex);
}
module.exports = {
	CalcAmount,
	GetUtxo,
	GetTxRaw,
	ReqTxID,
}