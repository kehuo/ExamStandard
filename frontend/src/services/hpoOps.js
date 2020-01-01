import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getHpoList(params) {
	let url = urls.getHpoList(params);
	return request(url);
}

export async function editHpo(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getHpoList({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getHpoOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteHpo(record) {
	let url = urls.getHpoOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getHpoParentTree(record) {
	let url = urls.getHpoParentTreeUrl(record.id);
	return request(url);
}