import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getFeedbackList(params) {
	let url = urls.getFeedbackListUrl(params);
	return request(url);
}
