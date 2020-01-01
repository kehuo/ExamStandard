import * as urls from '../utils/masterUrls';
import request from '@/utils/request';

export async function getHpoMappingList(params) {
	let url = urls.getHpoMappingListUrl(params);
	return request(url);
}

export async function deleteHpoMappingOne(recordId) {
	let url = urls.getHpoMappingOneUrl(recordId);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function createHpoMappingOne(record) {
	let url = urls.getHpoMappingListUrl({});
	return request(url, {
		method: 'POST',
		body: {
			data: record,
			method: 'post',
		},
	});
}

export async function updateHpoMappingOne(record) {
	let url = urls.getHpoMappingOneUrl(record.id);
	return request(url, {
		method: 'PUT',
		body: {
			data: record,
			method: 'put',
		},
	});
}

export async function getHpoMappingSuggest(params) {
	let url = urls.getHpoMappingSuggestUrl({});
	return request(url, {
		method: 'POST',
		body: {
			data: params,
			method: 'post',
		},
	});
}
