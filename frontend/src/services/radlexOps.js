import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getRadlexList(params) {
	let url = urls.getRadlexListUrl(params);
	return request(url);
}

export async function getRadlexOne(caseId) {
	let url = urls.getRadlexOneUrl(caseId);
	return request(url);
}

export async function editRadlexOne(record) {
	let url = urls.getRadlexOneUrl(record.id);
	return request(url, {
		method: 'PUT',
		body: {
			data: record,
			method: 'put',
		},
	});
}

export async function getRadlexParentTree(rid) {
	let url = urls.getRadlexParentTreeUrl(rid);
	return request(url);
}
