import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function queryTagsList(params) {
	let url = urls.getTagsUrl(params)
	return request(url);
}

export async function editTagOne(record) {
	let url = urls.editTagOneUrl(record.id)
	return request(url, {
		method: 'PUT',
		body: {
			...record,
			method: 'put',
		},
	});
}

export async function createTagOne(record) {
	let url = urls.createTagOneUrl();
	delete record.id;
	return request(url, {
		method: 'POST',
		body: {
			...record,
			method: 'post',
		},
	});
}
