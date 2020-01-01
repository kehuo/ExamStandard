import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getSnomedCTList(params) {
	let url = urls.getSnomedCTListUrl(params);
	return request(url);
}

export async function getSnomedCTOne(caseId) {
	let url = urls.getSnomedCTOneUrl(caseId);
	return request(url);
}

export async function editSnomedCTOne(record) {
	let url = urls.getSnomedCTOneUrl(record.id);
	return request(url, {
		method: 'PUT',
		body: {
			data: record,
			method: 'put',
		},
	});
}

// export async function getFMAParentTree(rid) {
// 	let url = urls.getFMAParentTreeUrl(rid);
// 	return request(url);
// }

export async function getSnomedCTOneByCode(code) {
	let url = urls.getSnomedCTOneByCodeUrl(code);
	return request(url);
}
