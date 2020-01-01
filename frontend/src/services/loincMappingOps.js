import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getLoincObjMappingList(params) {
	let url = urls.getLoincObjMappingListUrl(params);
	return request(url);
}

export async function getLoincObjMappingOne(caseId) {
	let url = urls.getLoincObjMappingOneUrl(caseId);
	return request(url);
}

export async function editLoincObjMappingOne(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getLoincObjMappingListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getLoincObjMappingOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteLoincObjMappingOne(record) {
	let url = urls.getLoincObjMappingOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getLoincStep0MappingList(params) {
	let url = urls.getLoincStep0MappingListUrl(params);
	return request(url);
}

export async function getLoincStep0MappingOne(caseId) {
	let url = urls.getLoincStep0MappingOneUrl(caseId);
	return request(url);
}

export async function editLoincStep0MappingOne(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getLoincStep0MappingListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getLoincStep0MappingOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteLoincStep0MappingOne(record) {
	let url = urls.getLoincStep0MappingOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
