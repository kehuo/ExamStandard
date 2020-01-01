import * as urls from '../utils/rareDiseaseUrls';
import request from '@/utils/request';

//===============
export async function getCnRareDiseaseList(params) {
	let url = urls.getCnRareDiseaseListUrl(params);
	return request(url);
}

export async function editCnRareDisease(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getCnRareDiseaseListUrl({});
		return request(url, {
			method: 'POST',
			body: record,
		});
	} else {
		let url = urls.getCnRareDiseaseOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body:record,
		});
	}
}

export async function deleteCnRareDisease(record) {
	let url = urls.getCnRareDiseaseOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

//===============
export async function getWorldRareDiseaseList(params) {
	let url = urls.getWorldRareDiseaseListUrl(params);
	return request(url);
}

export async function editWorldRareDisease(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getWorldRareDiseaseListUrl({});
		return request(url, {
			method: 'POST',
			body: record
		});
	} else {
		let url = urls.getWorldRareDiseaseOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: record
		});
	}
}

export async function deleteWorldRareDisease(record) {
	let url = urls.getWorldRareDiseaseOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

//===============
export async function getRareDiseaseCnMappingList(params) {
	let url = urls.getRareDiseaseCnMappingListUrl(params);
	return request(url);
}

export async function editRareDiseaseCnMapping(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getRareDiseaseCnMappingListUrl({});
		return request(url, {
			method: 'POST',
			body: record
		});
	} else {
		let url = urls.getRareDiseaseCnMappingOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: record,
		});
	}
}

export async function deleteRareDiseaseCnMapping(record) {
	let url = urls.getRareDiseaseCnMappingOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

//===============
export async function getRareDiseaseHpoMappingList(params) {
	let url = urls.getRareDiseaseHpoMappingListUrl(params);
	return request(url);
}

export async function editRareDiseaseHpoMapping(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getRareDiseaseHpoMappingListUrl({});
		return request(url, {
			method: 'POST',
			body: record,
		});
	} else {
		let url = urls.getRareDiseaseHpoMappingOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: record,
		});
	}
}

export async function deleteRareDiseaseHpoMapping(record) {
	let url = urls.getRareDiseaseHpoMappingOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

//===============
export async function getRareDiseaseHpoList(params) {
	let url = urls.getRareDiseaseHpoListUrl(params);
	return request(url);
}

export async function editRareDiseaseHpo(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getRareDiseaseHpoListUrl({});
		return request(url, {
			method: 'POST',
			body: record,
		});
	} else {
		let url = urls.getRareDiseaseHpoOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: record,
		});
	}
}

export async function deleteRareDiseaseHpo(record) {
	let url = urls.getRareDiseaseHpoOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getRareDiseaseHpoParentTree(record) {
	let url = urls.getRareDiseaseHpoParentTreeUrl(record.id);
	return request(url);
}
