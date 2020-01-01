import * as urls from '../utils/masterUrls';
import request from '@/utils/request';

export async function getTestResult(params) {
	let url = urls.getTotalTestUrl();
	return request(url, {
		method: 'POST',
		body: {
			mode: params['mode'],
			data: params['data'],
			method: 'post',
		},
	});
}