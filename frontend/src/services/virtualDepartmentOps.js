import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getVirtualDepartmentList(params) {
	let url = urls.getVirtualDepartmentListUrl(params);
	return request(url);
}

export async function editVirtualDepartment(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getVirtualDepartmentListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getVirtualDepartmentOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteVirtualDepartment(record) {
	let url = urls.getVirtualDepartmentOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getVirtualDepartmentOne(id) {
	let url = urls.getVirtualDepartmentOneUrl(id);
	return request(url);
}
