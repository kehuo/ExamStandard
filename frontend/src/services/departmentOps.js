import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getDepartmentList(params) {
	let url = urls.getDepartmentUrl(params);
	return request(url);
}

export async function editDepartment(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getDepartmentUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getDepartmentOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteDepartment(record) {
	let url = urls.getDepartmentOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
