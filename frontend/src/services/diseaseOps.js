import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getDiseaseList(params) {
	let url = urls.getDiseaseListUrl(params);
	return request(url);
}

export async function editDisease(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getDiseaseListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getDiseaseOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteDisease(record) {
	let url = urls.getDiseaseOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
