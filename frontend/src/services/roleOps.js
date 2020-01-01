import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getRoleList(params) {
	let url = urls.getRoleUrl(params);
	return request(url);
}

export async function editRole(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getRoleUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getRoleOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteRole(record) {
	let url = urls.getRoleOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
