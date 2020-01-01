import * as urls from '../utils/masterUrls';
import request from '@/utils/request';

export async function getMasterDataList(params) {
	let url = urls.getMasterDataListUrl(params);
	return request(url);
}

export async function getMasterDataOne(typeM, id) {
	let url = urls.getMasterDataOneUrl(id, typeM);
	return request(url);
}

export async function editMasterDataOne(typeM, record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getMasterDataListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				type: typeM,
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getMasterDataOneUrl(record.id, typeM);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteMasterDataOne(typeM, record) {
	let url = urls.getMasterDataOneUrl(record.id, typeM);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getMasterDataListSearch(params) {
	let url = urls.getMasterListSearchUrl(params);
	return request(url);
}

export async function getMasterParentTree(params) {
	let url = urls.getMasterParentTreeUrl(params);
	return request(url);
}

export async function getMasterDataFuncTest(params) {
	let url = urls.getMasterDataFuncTestUrl();
	return request(url, {
		method: 'POST',
		body: {
			data: params,
			method: 'post',
		},
	});
}

export async function getMasterDataFuncGen(record) {
	let url = urls.getMasterDataFuncGenUrl(record.id);
	return request(url);
}

export async function getMasterDataOneComplicate(typeM, id) {
	let url = urls.getMasterDataOneComplicateUrl(id, typeM);
	return request(url);
}

export async function getMasterDataOneExtension(typeM, id) {
	let url = urls.getMasterDataOneExtensionUrl(id, typeM);
	return request(url);
}

export async function createSmartExpand(typeM, record) {
	let url = urls.createSmartExpandUrl();
	return request(url, {
		method: 'POST',
		body: {
			type: typeM,
			data: record,
			method: 'post',
		},
	});
}