import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getPackageList(params) {
	let url = urls.getPackageListUrl(params)
	return request(url);
}

export async function updatePackageStatus(params) {
	let url = urls.getPackageOneUrl(params.id)
	return request(url, {
		method: 'PUT',
		body: {
			status: params.status,
			method: 'put',
		},
	});
}

export async function getDiseaseList(params) {
	let url = urls.getDiseaseListUrl(params);
	return request(url);
}

export async function getPackageOne(id) {
	let url = urls.getPackageOneUrl(id)
	return request(url);
}

export async function getSmartPackageByDiseaseName(params) {
	let url = urls.getPackageByDiseaseUrl(params)
	return request(url);
}

export async function editPackageOne(payload) {
	let record = payload.data;
	let body = {
		data: record,
		method: 'POST',
	};
	if (payload.virtualdept) {
		body.virtualdept = payload.virtualdept;
	}
	let url = urls.getPackageOneUrl(record.id)
	return request(url, {
		method: 'POST',
		body: body,
	});
}

export async function getTemplatePreview(params) {
	let url = urls.getTemplatePreview();
	return request(url, {
		method: 'POST',
		body: {
			...params,
			method: 'post',
		},
	});
}

export async function getTemplateTest(params) {
	let url = urls.getTemplateTest();
	return request(url, {
		method: 'POST',
		body: {
			...params,
			method: 'post',
		},
	});
}

export async function queryEntitySegment(params) {
	let url = urls.getEntitySegmentUrl(params)
	return request(url);
}

export async function queryPhysicalSegment(params) {
	let url = urls.getPhysicalSegmentUrl(params)
	return request(url);
}

export async function getTemplateUpdateStatusList(params) {
	let url = urls.getTemplateUpdateStatusListUrl(params)
	return request(url);
}

export async function getDoctorTemplateList(params) {
	let url = urls.getDoctorTemplateListUrl(params)
	return request(url);
}

export async function getDoctorTemplateOne(templateId) {
	let url = urls.getDoctorTemplateOneUrl(templateId)
	return request(url);
}
