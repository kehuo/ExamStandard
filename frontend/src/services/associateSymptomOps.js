import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getAssociatedSymptomList(params) {
	let url = urls.getAssociatedSymptomListUrl(params);
	return request(url);
}

export async function editAssociatedSymptom(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getAssociatedSymptomListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getAssociatedSymptomOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteAssociatedSymptom(record) {
	let url = urls.getAssociatedSymptomOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
