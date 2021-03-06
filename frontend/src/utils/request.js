import fetch from 'dva/fetch';
import {notification, message} from 'antd';
import router from 'umi/router';
import hash from 'hash.js';
import {isAntdPro} from './utils';
import cookies from './cookies';
import {getDomain} from "./utils";
import {config} from '../config';

// const codeMessage = {
//   200: '服务器成功返回请求的数据。',
//   201: '新建或修改数据成功。',
//   202: '一个请求已经进入后台排队（异步任务）。',
//   204: '删除数据成功。',
//   400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
//   401: '用户没有权限（令牌、用户名、密码错误）。',
//   403: '用户得到授权，但是访问是被禁止的。',
//   404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
//   406: '请求的格式不可得。',
//   410: '请求的资源被永久删除，且不会再得到的。',
//   422: '当创建一个对象时，发生一个验证错误。',
//   500: '服务器发生错误，请检查服务器。',
//   502: '网关错误。',
//   503: '服务不可用，服务器暂时过载或维护。',
//   504: '网关超时。',
// };

const errorMessage = {
	// old
	':<(': '服务器错误',
	'-1': '服务器错误',
	BAUTH_TOKEN_MISSING: '登录信息已过期',
	PERMISSION_DENY: '未授权',
	AUTH_FAILED: '用户名密码错误，请重新登录'
};

const checkStatus = response => {
	if (response.status >= 200 && response.status < 300) {
		return response;
	}

	response.json().then((responseObj) => {
		if (responseObj.errorCode === 'BAUTH_TOKEN_MISSING') {
			window.g_app._store.dispatch({
				type: 'login/logout',
				payload: null
			});
			let errortext = errorMessage[responseObj.errorCode] || responseObj.errMesssage;
			message.error(errortext);
			return responseObj;
		}
		let errortext = errorMessage[responseObj.errorCode] || responseObj.errMessage;
		message.error(errortext);
		return responseObj;
	});
};

// 登陆时将 token 写入cookie
function setBauthToken(response) {
	let token = response.headers.get('x-bb-set-bauthtoken');
	if (token) {
		let domain = getDomain();
		cookies.setItem(config.csrfTokenName, token, '', '/', domain);
	}
	return response;
}

function addBauthToken(dic, tokenName) {
	let token = cookies.getItem(tokenName);
	if (token) {
		dic[config.bauthTokenName] = `Bearer ${token}`;
	}
}

const cachedSave = (response, hashcode) => {
	/**
	 * Clone a response data and store it in sessionStorage
	 * Does not support data other than json, Cache only json
	 */
	const contentType = response.headers.get('Content-Type');
	if (contentType && contentType.match(/application\/json/i)) {
		// All data is saved as text
		response
			.clone()
			.text()
			.then(content => {
				sessionStorage.setItem(hashcode, content);
				sessionStorage.setItem(`${hashcode}:timestamp`, Date.now());
			});
	}
	return response;
};

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url,
                                options = {
	                                expirys: isAntdPro(),
                                }) {
	/**
	 * Produce fingerprints based on url and parameters
	 * Maybe url has the same parameters
	 */
	const fingerprint = url + (options.body ? JSON.stringify(options.body) : '');
	const hashcode = hash
		.sha256()
		.update(fingerprint)
		.digest('hex');

	const defaultOptions = {
		// credentials: 'include',
		credentials: 'omit',
		headers: {
			'Access-Control-Allow-Credentials': true,
			// 'Access-Control-Allow-Headers': 'cache-control,content-type,hash-referer,x-requested-with',
			'Access-Control-Allow-Origin': '*',
		},
	};
	const newOptions = {...defaultOptions, ...options};
	if (
		newOptions.method === 'POST' ||
		newOptions.method === 'PUT' ||
		newOptions.method === 'DELETE'
	) {
		if (!(newOptions.body instanceof FormData)) {
			newOptions.headers = {
				Accept: 'application/json',
				'Content-Type': 'application/json; charset=utf-8',
				'Access-Control-Allow-Credentials': true,
				'Access-Control-Allow-Origin': '*',
				...newOptions.headers,
			};
			newOptions.body = JSON.stringify(newOptions.body);
		} else {
			// newOptions.body is FormData
			newOptions.headers = {
				Accept: 'application/json',
				'Access-Control-Allow-Credentials': true,
				'Access-Control-Allow-Origin': '*',
				...newOptions.headers,
			};
		}
	}

	const expirys = options.expirys || 60;
	// options.expirys !== false, return the cache,
	if (options.expirys !== false) {
		const cached = sessionStorage.getItem(hashcode);
		const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`);
		if (cached !== null && whenCached !== null) {
			const age = (Date.now() - whenCached) / 1000;
			if (age < expirys) {
				const response = new Response(new Blob([cached]));
				return response.json();
			}
			sessionStorage.removeItem(hashcode);
			sessionStorage.removeItem(`${hashcode}:timestamp`);
		}
	}
	addBauthToken(newOptions.headers, config.csrfTokenName);
	return fetch(url, newOptions)
		.then(checkStatus)
		.then(setBauthToken)
		.then(response => cachedSave(response, hashcode))
		.then(response => {
			// DELETE and 204 do not return data by default
			// using .json will report an error.
			// if (newOptions.method === 'DELETE' || response.status === 204) {
			if (response.headers.get("Content-Type") === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
				return response.blob();
			}
			if (response.status === 204) {
				return response.text();
			}
			return response.json();
		})
		.catch(e => {
			const status = e.name;
			if (status === 401) {
				// @HACK
				/* eslint-disable no-underscore-dangle */
				window.g_app._store.dispatch({
					type: 'login/logout',
				});
				return;
			}
			// environment should not be used
			if (status === 403) {
				router.push('/exception/403');
				return;
			}
			if (status <= 504 && status >= 500) {
				router.push('/exception/500');
				return;
			}
			if (status >= 404 && status < 422) {
				router.push('/exception/404');
			}
		});
}
