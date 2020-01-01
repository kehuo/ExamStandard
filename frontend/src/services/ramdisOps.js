import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getRamdisList(params) {
	let url = urls.getRamdisListUrl(params);
	return request(url);
}

export async function getRamdisOne(caseId) {
	let url = urls.getRamdisOneUrl(caseId);
	return request(url);
}

export async function editRamdisOne(record) {
	let url = urls.getRamdisOneUrl(record.id);
	return request(url, {
		method: 'PUT',
		body: {
			data: record,
			method: 'put',
		},
	});
}
