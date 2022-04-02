//2 level
const fs = require('fs');
const { Hash256 } = require('./../endcrypt');
//
const GenNameTag = (name, marker, pwd_hash) => {
	if(name.length > 16) {
		return false;
	}
	const p = Hash256(name + pwd_hash + marker);
	const hash6 = '0' + p[0] + p[1] + p[3] + p[7] + p[15];
	const tag = name.padEnd(16, '*');
	return '<' + tag + hash6 + '>';
}
const ControlRegLine = (regline, pwd_hash) => {
	const regtest = new RegExp('(<(\\w+)\\**\\w+>)([A-Za-z0-9\\/_=+]+)', 'g');
	const match = Array.from(regline.matchAll(regtest));
	const name = match[0][2];
	const marker = match[0][3];
	const answer = GenNameTag(name, marker, pwd_hash);
	if(answer && answer == match[0][1]) {
		return true;
	}
	else {
		return false;
	}
}
const ExtractMarker = (regline, pwd_hash) => {
	const regtest = new RegExp('(<(\\w+)\\**\\w+>)([A-Za-z0-9\\/_=+]+)', 'g');
	const match = Array.from(regline.matchAll(regtest));
	if(!match[0]) return false;
	const name = match[0][2];
	const marker = match[0][3];
	const answer = GenNameTag(name, marker, pwd_hash);
	if(answer && answer == match[0][1]) {
		return { marker, res: true };
	}
	else {
		return { marker, res: false};
	}
}
const WriteRegLine = (initfile, regline) => {
	return new Promise((resolve, reject) => {
		try {
			fs.appendFileSync(initfile, regline + '\n', 'utf8');
			resolve(true);
		}
		catch (err) {
			reject(err);
		}
	});
}
const CheckOverlap = (initfile, name) => {
	return new Promise((resolve, reject) => {
		const regtest = new RegExp(`<${name}\\**\\w+>[A-Za-z\\/0-9_=+]+`, 'g');
		try{
			if(!name)resolve(false);
			const internal = fs.readFileSync(initfile, 'utf8');
			const match = Array.from(internal.matchAll(regtest));
			if(match[0]) resolve(match[0][0]);
			else resolve(false);
		}
		catch (err) {
			reject(err);
		}
	});
}
const RemoveLine = (initfile, regline, pwd_hash) => {
	return new Promise((resolve, reject) => {
		try {
			//get data and replace line
			if(!regline || !pwd_hash) {
				//falied to delete
				resolve(false);
				return 
			}
			const mrk = ExtractMarker(regline, pwd_hash);
			if(!mrk || !mrk.res) {
				//failed to delete
				resolve(false);
				return
			}
			const internal = fs.readFileSync(initfile, 'utf8');
			const data = internal.replace(regline + '\n','');
			fs.writeFileSync(initfile, data, 'utf8');
			resolve(mrk.marker);
			return
		}
		catch (err) {
			//reject error
			reject(err);
		}
	});
}
module.exports = {
	GenNameTag,
	ControlRegLine,
	WriteRegLine,
	ExtractMarker,
	CheckOverlap,
	RemoveLine
}
