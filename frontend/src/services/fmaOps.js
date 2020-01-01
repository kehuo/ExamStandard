import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getFMAList(params) {
	let url = urls.getFMAListUrl(params);
	return request(url);
}

export async function getFMAOne(caseId) {
	let url = urls.getFMAOneUrl(caseId);
	return request(url);
}

export async function editFMAOne(record) {
	let url = urls.getFMAOneUrl(record.id);
	return request(url, {
		method: 'PUT',
		body: {
			data: record,
			method: 'put',
		},
	});
}

export async function getFMAParentTree(rid) {
	let url = urls.getFMAParentTreeUrl(rid);
	return request(url);
}
