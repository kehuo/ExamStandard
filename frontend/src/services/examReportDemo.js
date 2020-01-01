import * as urls from '../utils/urls';
import request from '@/utils/request';

// 该文件是 11-14 新建的文件，专门用来添加 "检查报告结构化demo页面" 的后台API调用

// 新建的函数1 > 获取所有的 exam_report list
export async function getExamReportList(params) {
	let url = urls.getExamReportListUrl(params);
	return request(url);
}

// 新建函数2 > 获取单个 exam_report 的结构化+归一化数据 
export async function getExamReportResultOne(record) {
	let url = urls.getExamReportResultOneUrl(record);
	return request(url);
}

// 以下4个是原有的
// export async function getTrackAuthLogList(params) {
// 	let url = urls.getTrackAuthLogListUrl(params);
// 	return request(url);
// }

// export async function getTrackAuthLogOne(record) {
// 	let url = urls.getTrackAuthLogOneUrl(record.id);
// 	return request(url);
// }

// export async function getTrackAuthLogCompare(params) {
// 	let url = urls.getTrackAuthLogCompareUrl(params);
// 	return request(url);
// }

// export async function getTrackAuthLogOneNlp(params) {
// 	let url = urls.getTrackAuthLogOneNlpUrl(params);
// 	return request(url);
// }
