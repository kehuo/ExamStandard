import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getVisitInfoList(params) {
	let url = urls.getVisitInfoListUrl(params);
	return request(url);
}

export async function getVisitInfoOne(id) {
	let url = urls.getVisitInfoOneUrl(id);
	return request(url);
}
