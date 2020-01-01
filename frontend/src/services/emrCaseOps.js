import * as urls from '../utils/trainUrls';
import request from '@/utils/request';

// emr case
export async function getRawEmrCaseList(params) {
	let url = urls.getRawEmrCaseListUrl(params);
	return request(url);
}

export async function editRawEmrCase(record) {
	if (!record.id || record.id == 0 || record.id == '0') {
		let url = urls.getRawEmrCaseListUrl(null);
		return request(url, {
			method: 'POST',
			body: record,
		});
	} else {
		let url = urls.getRawEmrCaseOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: record,
		});
	}
}

export async function deleteRawEmrCase(record) {
	let url = urls.getRawEmrCaseOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getRawEmrCase(id) {
	let url = urls.getRawEmrCaseOneUrl(id);
	return request(url);
}


// guide document
export async function getGuideDocumentList(params) {
	let url = urls.getGuideDocumentListUrl(params);
	return request(url);
}

export async function editGuideDocument(record) {
	if (!record.id || record.id == 0 || record.id == '0') {
		let url = urls.getGuideDocumentListUrl(null);
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getGuideDocumentOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteGuideDocument(record) {
	let url = urls.getGuideDocumentOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getGuideDocument(id) {
	let url = urls.getGuideDocumentOneUrl(id);
	return request(url);
}

