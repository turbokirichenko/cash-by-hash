//equal functions
const eq = (loadResult, expectResult) => {
	if(loadResult != expectResult) {
		throw new Error('the result does not match the expected value!');
	}
}
const eq_number = (loadResult, expectResult) => {
	if(typeof loadResult === 'number' && typeof expectResult === 'number') {
		if(loadResult != expectResult) {
			throw new Error('the result does not match the expected value!');
		}
	}
	else throw new Error('type error')
}
const eq_string = (loadResult, expectResult) => {
	if(typeof loadResult === 'string' && typeof expectResult === 'string') {
		if(loadResult != expectResult) {
			throw new Error('the result does not match the expected value!');
		}
	}
	else throw new Error('type error')
}
const eq_object = (loadResult, expectResult) => {
	if(typeof loadResult === 'object' && typeof expectResult === 'object') {
		if(loadResult != expectResult) {
			throw new Error('the result does not match the expected value!');
		}
	}
	else throw new Error('type error')
}
module.exports = {eq, eq_number, eq_string, eq_object};