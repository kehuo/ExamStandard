import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getHeredopathiaHpoList(params) {
	let url = urls.getHeredopathiaHpoListUrl(params);
	return request(url);
}

export async function editHeredopathiaHpo(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getHeredopathiaHpoListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getHeredopathiaHpoOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteHeredopathiaHpo(record) {
	let url = urls.getHeredopathiaHpoOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
