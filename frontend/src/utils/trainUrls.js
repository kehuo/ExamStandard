import { stringify } from 'qs';

const { OpApi } = global;
const trainBase = 'model_train';

import { buildUrlWithTs } from './utils';

// task APIs
export function getTrainTaskListUrl(params) {
	if (!params) {
		// return `${OpApi}/${trainBase}/tasks`;
		let baseUrl = `${OpApi}/${trainBase}/tasks`;
		return buildUrlWithTs(baseUrl, {});
	}
	// return `${OpApi}/${trainBase}/tasks?${stringify(params)}`;
	let baseUrl = `${OpApi}/${trainBase}/tasks`;
	return buildUrlWithTs(baseUrl, params);
}

export function getTrainTaskOneUrl(id) {
	// return `${OpApi}/${trainBase}/task/${id}`;
	let baseUrl = `${OpApi}/${trainBase}/task/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

// task data APIs
export function getTrainDataListUrl(params = {}) {
	// return `${OpApi}/${trainBase}/task-data?${stringify(params)}`;
	let baseUrl = `${OpApi}/${trainBase}/task-data`;
	return buildUrlWithTs(baseUrl, params);
}

export function getTrainDataOneUrl(id) {
	// return `${OpApi}/${trainBase}/task-data/${id}`;
	let baseUrl = `${OpApi}/${trainBase}/task-data/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

// task op & log APIs
export function getTrainTaskOpUrl(id) {
	// return `${OpApi}/${trainBase}/task/${id}/op`;
	let baseUrl = `${OpApi}/${trainBase}/task/${id}/op`;
	return buildUrlWithTs(baseUrl, {});
}

export function getTaskLogOneUrl(id, params) {
	// return `${OpApi}/${trainBase}/task/${id}/log?${stringify(params)}`;
	let baseUrl = `${OpApi}/${trainBase}/task/${id}/log`;
	return buildUrlWithTs(baseUrl, params);
}

export function getTaskPerformanceUrl(ids) {
	let idsA = [];
	for (let i=0; i<ids.length; i++) {
		idsA.push(''+ids[i]);
	}
	// let idsB = 'ids=' + idsA.join(',');
	// return `${OpApi}/${trainBase}/task/performance?${idsB}`;
	let params = {
		ids: idsA.join(',')
	};
	let baseUrl = `${OpApi}/${trainBase}/task/performance`;
	return buildUrlWithTs(baseUrl, params);
}

// emr case APIs may be deprecated
// export function getEmrCaseListUrl(params) {
// 	// return `${OpApi}/${trainBase}/emr-case?${stringify(params)}`;
// 	let baseUrl = `${OpApi}/${trainBase}/emr-case`;
// 	return buildUrlWithTs(baseUrl, params);
// }
//
// export function getEmrCaseOneUrl(id) {
// 	// return `${OpApi}/${trainBase}/emr-case/${id}`;
// 	let baseUrl = `${OpApi}/${trainBase}/emr-case/${id}`;
// 	return buildUrlWithTs(baseUrl, {});
// }

export function getRawEmrCaseListUrl(params) {
	let baseUrl = `${OpApi}/${trainBase}/raw-emrs`;
	return buildUrlWithTs(baseUrl, params);
}

export function getRawEmrCaseOneUrl(id) {
	let baseUrl = `${OpApi}/${trainBase}/raw-emrs/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getGuideDocumentListUrl(params) {
	// return `${OpApi}/${trainBase}/guide-document?${stringify(params)}`;
	let baseUrl = `${OpApi}/${trainBase}/guide-document`;
	return buildUrlWithTs(baseUrl, params);
}

export function getGuideDocumentOneUrl(id) {
	// return `${OpApi}/${trainBase}/guide-document/${id}`;
	let baseUrl = `${OpApi}/${trainBase}/guide-document/${id}`;
	return buildUrlWithTs(baseUrl, {});
}
