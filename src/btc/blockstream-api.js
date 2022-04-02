//blockstream api requests
const https = require('https');
const request = require('superagent');


//api testnet
let blockstreamAPI = new Map();
blockstreamAPI.set('BTCTEST', 'https://blockstream.info/testnet/api');
blockstreamAPI.set('BTCMAIN', 'https://blockstream.info/api');
//
const CalcAmount = (utxoArr) => {
	let amount = 0;
	for (let i = 0; i < utxoArr.length; ++i) {
		amount += utxoArr[i].value;
	}
	return amount;
}
//
const ReqUtxo = async (addr, net) => {
	try {
		const res = new Promise((resolve, reject)=> {
			https.get(blockstreamAPI.get(net) + '/address/' + addr + '/utxo', (res) => {
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
const ReqTxRaw = async (tx_id, net) => {
	try{
		const res = new Promise((resolve, reject) => {
			https.get(blockstreamAPI.get(net) + '/tx/' + tx_id +'/raw', (res) =>{
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
const ReqTxID = async (tx_raw, net) => {
	try {
		const res = await request.post(blockstreamAPI.get(net) + '/tx').send( tx_raw );
		if(!res || res.statusCode >= 300) return Promise.resolve(false);
		return Promise.resolve(res.text);
	}
	catch (err) {
		return Promise.reject(err);
	}
}
//
const GetUtxo = async (address, net) => {
	const result = await ReqUtxo(address, net);
	if(!result.status) return false;
	let utxo = [];
	utxo = Array.from(JSON.parse(result.utxo));
	return utxo;
}
//
const GetTxRaw = async (txid, net) => {
	const result = await ReqTxRaw(txid, net);
	if(!result.status) return false;
	return Promise.resolve(result.rawhex);
}
//fee : "fastest" - default, "halfHour", "hour"
const ReqRecommendedFee = async () => {
	const getfees = new Promise((resolve, reject) => {
		let out = '';
		https.get('https://bitcoinfees.earn.com/api/v1/fees/recommended', (res) => {
			res.setEncoding('utf8');
			let out = '';
			res.on('data', d=> {
				out = out + d;
			});
			res.on('end', () => {
				feesobj = JSON.parse(out);
				resolve(feesobj.fastestFee);
			});
		});
	});
	
	return getfees;
}

module.exports = {
	CalcAmount,
	GetUtxo,
	GetTxRaw,
	ReqTxID,
	ReqRecommendedFee,
}
