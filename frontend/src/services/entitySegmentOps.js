import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getEntitySegmentList(params) {
	let url = urls.getEntitySegmentUrl(params);
	return request(url);
}

export async function editEntitySegment(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getEntitySegmentUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getEntitySegmentOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteEntitySegment(record) {
	let url = urls.getEntitySegmentOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getDiseaseSystemList(params) {
	let url = urls.getDiseaseSystemUrl(params);
	return request(url);
}
