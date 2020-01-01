import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getTrackAuthLogList(params) {
	let url = urls.getTrackAuthLogListUrl(params);
	return request(url);
}

export async function getTrackAuthLogOne(record) {
	let url = urls.getTrackAuthLogOneUrl(record.id);
	return request(url);
}

export async function getTrackAuthLogCompare(params) {
	let url = urls.getTrackAuthLogCompareUrl(params);
	return request(url);
}

export async function getTrackAuthLogOneNlp(params) {
	let url = urls.getTrackAuthLogOneNlpUrl(params);
	return request(url);
}
