import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getOrganizationList(params) {
	let url = urls.getOrganizationListUrl(params);
	return request(url);
}

export async function getDataSourceList(params) {
	let url = urls.getDataSourceListUrl(params);
	return request(url);
}

export async function editOrganization(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getOrganizationListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getOrganizationOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteOrganization(record) {
	let url = urls.getOrganizationOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getOrgCertificate() {
  let url = urls.getGenOrgCodeUrl();
  return request(url);
}
