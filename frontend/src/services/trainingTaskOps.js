import * as urls from '../utils/trainUrls';
import request from '@/utils/request';

// task
export async function getTrainingTaskList(params) {
	let url = urls.getTrainTaskListUrl(params);
	return request(url);
}

export async function editTrainingTask(record) {
	if (!record.id || record.id == 0 || record.id == '0') {
		let url = urls.getTrainTaskListUrl(null);
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getTrainTaskOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteTrainingTask(record) {
	let url = urls.getTrainTaskOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getTrainingTask(id) {
	let url = urls.getTrainTaskOneUrl(id);
	return request(url);
}

export async function getTrainTaskLog(id, params) {
	let url = urls.getTaskLogOneUrl(id, params);
	return request(url);
}

export async function postTrainingTaskOp(id, opCode) {
	let url = urls.getTrainTaskOpUrl(id);
	return request(url, {
		method: 'PUT',
		body: {
			action: opCode,
			method: 'put',
		},
	});
}

// task data
export async function getTrainDataList(params) {
	let url = urls.getTrainDataListUrl(params);
	return request(url);
}

export async function editTrainingData(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getTrainDataListUrl();
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getTrainDataOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteTrainingData(record) {
	let url = urls.getTrainDataOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getTrainingData(id) {
	let url = urls.getTrainDataOneUrl(id);
	return request(url);
}

export async function getTrainingTaskPerformance(ids) {
	let url = urls.getTaskPerformanceUrl(ids);
	return request(url);
}
