import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getPrototypeList(params) {
	let url = urls.getPrototypeListUrl(params);
	return request(url);
}

export async function getPrototypeOne(caseId) {
	let url = urls.getPrototypeOneUrl(caseId);
	return request(url);
}
