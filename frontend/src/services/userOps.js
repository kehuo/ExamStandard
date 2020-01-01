import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getUserList(params) {
	let url = urls.getUserUrl(params);
	return request(url);
}

export async function editUser(record) {
	if (record.id == 0 || record.id == '0') {
		let url = urls.getUserUrl({});
		return request(url, {
			method: 'POST',
			body: {
				data: record,
				method: 'post',
			},
		});
	} else {
		let url = urls.getUserOneUrl(record.id);
		return request(url, {
			method: 'PUT',
			body: {
				data: record,
				method: 'put',
			},
		});
	}
}

export async function deleteUser(record) {
	let url = urls.getUserOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}

export async function signIn(params) {
	let url = urls.signInUrl();
	return request(url, {
	    method: 'POST',
	    body: {
		    ...params,
		    method: 'post',
	    },
	});
}

export async function signOut(params) {
	let url = urls.signOutUrl();
	return request(url, {
		method: 'POST',
		body: {
			...params,
			method: 'post',
		},
	});
}


export async function getCurrentUser() {
    let url = urls.getCurrentUserUrl();
    return request(url);
}