import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getTrackLogList(params) {
	let url = urls.getTrackLogListUrl(params);
	return request(url);
}

export async function getTrackLogOne(record) {
	let url = urls.getTrackLogOneUrl(record.id);
	return request(url);
}
