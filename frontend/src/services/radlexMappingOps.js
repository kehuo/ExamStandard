import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getRadlexMappingList(params) {
	let url = urls.getRadlexMappingListUrl(params);
	return request(url);
}

export async function getRadlexMappingOne(caseId) {
	let url = urls.getRadlexMappingOneUrl(caseId);
	return request(url);
}

export async function editRadlexMappingOne(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getRadlexMappingListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getRadlexMappingOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteRadlexMappingOne(record) {
	let url = urls.getRadlexMappingOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}