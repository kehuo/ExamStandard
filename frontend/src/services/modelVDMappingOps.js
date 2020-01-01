import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getModelVDMappingList(params) {
	let url = urls.getModelVDMappingListUrl(params);
	return request(url);
}

export async function getModelVDMappingOne(id) {
	let url = urls.getModelVDMappingOneUrl(params);
	return request(url);
}

export async function editModelVDMapping(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getModelVDMappingListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getModelVDMappingOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteModelVDMapping(record) {
	let url = urls.getModelVDMappingOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
