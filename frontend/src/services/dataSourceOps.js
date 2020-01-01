import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getDataSourceList(params) {
	let url = urls.getDataSourceListUrl(params);
	return request(url);
}

export async function editDataSource(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getDataSourceListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getDataSourceOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteDataSource(record) {
	let url = urls.getDataSourceOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
