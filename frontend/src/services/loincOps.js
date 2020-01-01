import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getLoincList(params) {
	let url = urls.getLoincListUrl(params);
	return request(url);
}

export async function getLoincOne(caseId) {
	let url = urls.getLoincOneUrl(caseId);
	return request(url);
}

export async function editLoincOne(record) {
	let url = urls.getLoincOneUrl(record.id);
	return request(url, {
		method: 'PUT',
		body: {
			data: record,
			method: 'put',
		},
	});
}
