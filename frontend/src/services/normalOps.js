import * as urls from '../utils/masterUrls';
import request from '@/utils/request';

export async function getVectorMappingList(params) {
	let url = urls.getVectorMappingListUrl(params);
	return request(url);
}

export async function getPropMappingList(params) {
	let url = urls.getPropMappingListUrl(params);
	return request(url);
}

export async function getSplitList(params) {
	let url = urls.getSplitListUrl(params);
	return request(url);
}

export async function getDiscardList(params) {
	let url = urls.getDiscardListUrl(params);
	return request(url);
}

export async function deleteDiscardOne(id) {
	let url = urls.deleteDiscardOneUrl(id);
	return request(url, {
		method: 'DELETE',
	});
}

export async function newDiscardOne(params) {
	let url = urls.newDiscardOneUrl();
	return request(url, {
		method: 'POST',
		body: params,
	});
}

export async function newSplitOne(params) {
	let url = urls.newSplitOneUrl();
	return request(url, {
		method: 'POST',
		body: params,
	});
}

export async function editSplitOne(params) {
	let url = urls.editSplitOneUrl(params.id);
	return request(url, {
		method: 'PUT',
		body: params,
	});
}

export async function deleteSplitOne(id) {
	let url = urls.deleteSplitOneUrl(id);
	return request(url, {
		method: 'DELETE',
	});
}

export async function newPropMappingOne(params) {
	let url = urls.newPropMappingOneUrl();
	return request(url, {
		method: 'POST',
		body: params,
	});
}

export async function editPropMappingOne(params) {
	let url = urls.editPropMappingOneUrl(params.id);
	return request(url, {
		method: 'PUT',
		body: params,
	});
}

export async function deletePropMappingOne(id) {
	let url = urls.deletePropMappingOneUrl(id);
	return request(url, {
		method: 'DELETE',
	});
}

export async function newVectorMappingOne(params) {
	let url = urls.newVectorMappingOneUrl();
	return request(url, {
		method: 'POST',
		body: params,
	});
}

export async function editVectorMappingOne(params) {
	let url = urls.editVectorMappingOneUrl(params.id);
	return request(url, {
		method: 'PUT',
		body: params,
	});
}

export async function deleteVectorMappingOne(id) {
	let url = urls.deleteVectorMappingOneUrl(id);
	return request(url, {
		method: 'DELETE',
	});
}

export async function getNormTaskList(params) {
	let url = urls.getNormTaskUrl(params);
	return request(url);
}

export async function doNormTaskOne(params) {
	let url = urls.doNormTaskOneUrl(params.id);
	return request(url, {
		method: 'POST',
		body: params,
	});
}

export async function updateNormTaskOne(params) {
	let url = urls.doNormTaskOneUrl(params.id);
	return request(url, {
		method: 'PUT',
		body: params,
	});
}

export async function emrReferOne(params) {
	let url = urls.emrReferOneUrl(params.id);
	return request(url);
}

export async function getVectorRef(params) {
	let url = urls.getVectorRefUrl(params);
	return request(url);
}