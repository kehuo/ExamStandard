import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getExamList(params) {
	let url = urls.getExamListUrl(params);
	return request(url);
}

export async function editExam(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getExamListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getExamOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteExam(record) {
	let url = urls.getExamOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
