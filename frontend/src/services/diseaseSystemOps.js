import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getDiseaseSystemList(params) {
	let url = urls.getDiseaseSystemUrl(params);
	return request(url);
}

export async function getDiseaseSystemOne(id) {
	let url = urls.getDiseaseSystemOneUrl(id);
	return request(url);
}

export async function editDiseaseSystem(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getDiseaseSystemUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getDiseaseSystemOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteDiseaseSystem(record) {
	let url = urls.getDiseaseSystemOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

