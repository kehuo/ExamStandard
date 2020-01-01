// use localStorage to store the authority info, which might be sent from server in actual project.
import cookies from './cookies';
import {config} from '../config';

export function getAuthority(str) {
	// return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
	// return ['admin', 'user'];
	let roleName = cookies.getItem(config.cookieRoleKey);
	const authorityString =
		// typeof str === 'undefined' ? localStorage.getItem('antd-pro-authority') : str;
		typeof str === 'undefined' ? roleName : str;

	// authorityString could be admin, "admin", ["admin"]
	let authority;
	try {
		authority = JSON.parse(authorityString);
	} catch (e) {
		authority = authorityString;
	}
	if (typeof authority === 'string') {
		return [authority];
	}
	return authority || ['admin'];
}

export function setAuthority(authority) {
	const proAuthority = typeof authority === 'string' ? [authority] : authority;
	return localStorage.setItem('antd-pro-authority', JSON.stringify(proAuthority));
}
