import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getDepartmentAIConfigList(params) {
	let url = urls.getDepartmentAIConfigListUrl(params);
	return request(url);
}

export async function editDepartmentAIConfig(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getDepartmentAIConfigListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getDepartmentAIConfigOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteDepartmentAIConfig(record) {
	let url = urls.getDepartmentAIConfigOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

