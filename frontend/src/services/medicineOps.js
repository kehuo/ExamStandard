import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getStdMedicineList(params) {
	let url = urls.getStdMedicineListUrl(params);
	return request(url);
}

export async function getStdMedicineOne(id) {
	let url = urls.getStdMedicineOneUrl(id);
	return request(url);
}

export async function editStdMedicine(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getStdMedicineListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getStdMedicineOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteStdMedicine(record) {
	let url = urls.getStdMedicineOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getOrgMedicineList(params) {
	let url = urls.getOrgMedicineListUrl(params);
	return request(url);
}

export async function getOrgMedicineOne(id) {
	let url = urls.getOrgMedicineOneUrl(id);
	return request(url);
}

export async function editOrgMedicine(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getOrgMedicineListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getOrgMedicineOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteOrgMedicine(record) {
	let url = urls.getOrgMedicineOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function getMedicineMappingList(params) {
	let url = urls.getMedicineMappingListUrl(params);
	return request(url);
}

export async function getMedicineMappingOne(id) {
	let url = urls.getMedicineMappingOneUrl(id);
	return request(url);
}

export async function editMedicineMapping(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getMedicineMappingListUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getMedicineMappingOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteMedicineMapping(record) {
	let url = urls.getMedicineMappingOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
