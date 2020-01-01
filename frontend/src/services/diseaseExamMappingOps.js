import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getDiseaseExamMappingList(params) {
	let url = urls.getDiseaseExamMappingListUrl(params)
	return request(url);
}

export async function createDiseaseExamMapping(record) {
	let url = urls.getDiseaseExamMappingListUrl();
	return request(url, {
		method: 'POST',
		body: {
			data: record,
			method: 'post',
		},
	});
}

export async function editDiseaseExamMapping(record) {
	let url = urls.editDiseaseExamMappingUrl(record.id);
	return request(url, {
		method: 'PUT',
		body: {
			data: record,
			method: 'PUT',
		},
	});
}

export async function deleteDiseaseExamMapping(record) {
	let url = urls.editDiseaseExamMappingUrl(record.id);
	return request(url, {
		method: 'DELETE',
	});
}

export async function getOrgnizationList(params) {
	let url = urls.getOrganizationListUrl(params);
	return request(url);
}

export  async function getOperatorList(params) {
	let url = urls.getOperatorListUrl(params);
	return request(url);
}

export async function getDiseaseList(params) {
	let url = urls.getDiseaseListUrl(params);
	return request(url);
}

export async function getExamList(params) {
	let url = urls.getExamListUrl(params);
	return request(url);
}
