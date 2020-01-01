import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getNotificationList(params) {
	let url = urls.getNotificationListUrl(params);
	return request(url);
}

export async function editNotification(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getNotificationListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getNotificationOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteNotification(record) {
	let url = urls.getNotificationOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
