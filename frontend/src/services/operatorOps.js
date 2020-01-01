import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getOperatorList(params) {
	let url = urls.getOperatorListUrl(params);
	return request(url);
}
