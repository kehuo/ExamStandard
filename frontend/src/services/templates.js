import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function queryTemplatesList(params) {
	let url = urls.getTemplatesUrl(params)
	return request(url);
}

export async function getTemplateOne(id) {
	let url = urls.getTemplateOneUrl(id)
	return request(url);
}

export async function editTemplateOne(record) {
	let url = urls.editTemplateOneUrl(record.id)
	return request(url, {
		method: 'PUT',
		body: {
			...record,
			method: 'put',
		},
	});
}

export async function createTemplateOne(record) {
	let url = urls.createTemplateOneUrl();
	delete record.id;
	return request(url, {
		method: 'POST',
		body: {
			...record,
			method: 'post',
		},
	});
}

export async function deleteTemplateOne(record) {
	let url = urls.deleteTemplateOneUrl(record.id)
	return request(url, {
		method: 'DELETE',
		body: {
			...record,
			method: 'delete',
		},
	});
}

export async function getSmartTemplate(source) {
	let url = urls.getSmartTemplateOneUrl()
	return request(url, {
		method: 'POST',
		body: {
			source: source,
			method: 'post',
		},
	});
}

export async function mergeTemplateOne(record) {
	let url = urls.mergeTemplateOneUrl();
	return request(url, {
		method: 'POST',
		body: {
			...record,
			method: 'post',
		},
	});
}
