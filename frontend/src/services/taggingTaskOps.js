import * as urls from '../utils/masterUrls';
import request from '@/utils/request';

export async function getTaggingTaskList(params) {
	let url = urls.getTaggingTaskListUrl(params);
	return request(url);
}

export async function getTaggingTaskOne(id) {
	let url = urls.getTaggingTaskOneUrl(id);
	return request(url);
}

export async function editTaggingTaskOne(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getTaggingTaskListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getTaggingTaskOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteTaggingTaskOne(record) {
	let url = urls.getTaggingTaskOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
