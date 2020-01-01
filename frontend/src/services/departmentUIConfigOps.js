import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getDepartmentUIConfigList(params) {
	let url = urls.getDepartmentUIConfigListUrl(params);
	return request(url);
}

export async function editDepartmentUIConfig(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getDepartmentUIConfigListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getDepartmentUIConfigOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteDepartmentUIConfig(record) {
	let url = urls.getDepartmentUIConfigOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

