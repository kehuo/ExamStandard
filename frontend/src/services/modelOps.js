import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getModelList(params) {
	let url = urls.getModelListUrl(params);
	return request(url);
}

export async function getModelOne(id) {
	let url = urls.getModelOneUrl(id);
	return request(url);
}

export async function editModel(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getModelListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getModelOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteModel(record) {
	let url = urls.getModelOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
