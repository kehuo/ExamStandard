import * as urls from '../utils/demoUrls';
import request from '@/utils/request';

export async function getTypeList() {
	let url = urls.getTypeListUrl();
	return request(url);
}

export async function getRecordsList(params) {
	let url = urls.getRecordsListUrl();
	let body = Object.assign({
		method: 'post',
	}, params);
	return request(url, {
		method: 'POST',
		body: body,
	});

	// return request(url, {
	// 	method: 'POST',
	// 	body: {
	// 		data: params,
	// 		method: 'post',
	// 	},
	// });
}

export async function getStructure(params) {
	let url = urls.getStructureUrl();
	let body = Object.assign({
		method: 'post',
	}, params);
	return request(url, {
		method: 'POST',
		body: body,
	});

	// return request(url, {
	// 	method: 'POST',
	// 	body: {
	// 		data: params,
	// 		method: 'post',
	// 	},
	// });
}