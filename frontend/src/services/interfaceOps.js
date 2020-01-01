import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getThirdPartyServiceList(params) {
	let url = urls.getThirdPartyServiceListUrl(params);
	return request(url);
}

export async function editThirdPartyService(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getThirdPartyServiceListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getThirdPartyServiceOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteThirdPartyService(record) {
	let url = urls.getThirdPartyServiceOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
