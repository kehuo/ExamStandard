import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getOrgSuggestFormatList(params) {
	let url = urls.getOrgSuggestFormatListUrl(params);
	return request(url);
}

export async function editOrgSuggestFormat(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getOrgSuggestFormatListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getOrgSuggestFormatOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteOrgSuggestFormat(record) {
	let url = urls.getOrgSuggestFormatOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getOrgSuggestFormatCandidates() {
	let url = urls.getOrgSuggestFormatCandidatesUrl();
	return request(url);
}
