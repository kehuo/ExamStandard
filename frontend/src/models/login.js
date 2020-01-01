import {routerRedux} from 'dva/router';
import {stringify} from 'qs';
// import { fakeAccountLogin, getFakeCaptcha } from '@/services/api';
import {setAuthority} from '@/utils/authority';
import {getPageQuery} from '@/utils/utils';
import {reloadAuthorized} from '@/utils/Authorized';
import cookies from '../utils/cookies';
import {getDomain} from "../utils/utils";
import {config} from '../config';
import {signIn, signOut} from '@/services/userOps';


let base64 = require('js-base64');

export default {
	namespace: 'login',

	state: {
		status: undefined,
		currentUser: {},
	},

	effects: {

		*login({payload}, {call, put}) {
			let rsSignIn = yield call(signIn, payload);

			if (rsSignIn && rsSignIn.data) {
				let rsUser = rsSignIn.data;
				let current = {
					status: true,
					id: rsUser.id,
					orgCode: rsUser.orgCode,
					currentAuthority: rsUser.roleName,
					userName: rsUser.name,
					fullName: rsUser.fullName,
					email: rsUser.email,
					disabled: rsUser.disabled,
					roleId: rsUser.roleId,
					orgName: rsUser.orgName,
					roleName: rsUser.roleName
				};


				let response = {
					status: true,
					id: rsUser.id,
					currentAuthority: rsUser.roleName,
					userName: rsUser.name,
					fullName: rsUser.fullName,
					orgCode: rsUser.orgCode,
					email: rsUser.email,
					orgName: rsUser.orgName,
				};

				yield put({
					type: 'changeLoginStatus',
					payload: response
				});
				yield put({
					type: 'user/saveCurrentUser',
					payload: current
				});
				reloadAuthorized();
				let nextPage = '/welcome';
				if (rsUser.roleName == 'dataengineer') {
					nextPage = '/tagging-normal/tagging-list';
				}
				yield put(routerRedux.push(nextPage));
			}
		},

		*getCaptcha({callback}, {call, put}) {
			const response = yield call(captcha);

			if (callback) {
				callback(response);
			}
		},

		*logout({payload}, {call, put, select}) {
			if (payload !== null) {
				let rst = yield call(signOut, payload);
			}
			try {
				// get location pathname
				const urlParams = new URL(window.location.href);
				const pathname = yield select(state => state.routing.location.pathname);
				// add the parameters in the url
				urlParams.searchParams.set('redirect', pathname);
				window.history.replaceState(null, 'login', urlParams.href);
			} finally {
				yield put({
					type: 'changeLoginStatus',
					payload: {
						status: false,
						currentAuthority: 'guest',
					},
				});
				reloadAuthorized();
				yield put(routerRedux.push('/user/login'));
			}
		},
	},

	reducers: {
		saveCurrentUser(state, action) {
			return {
				...state,
				currentUser: action.payload,
			};
		},
		changeLoginStatus(state, {payload}) {
			setAuthority(payload.currentAuthority);
			const lpl = base64.Base64.encode(JSON.stringify(payload));
			cookies.setItem(config.cookieName, lpl, '', '/', getDomain());
			return {
				...state,
				...payload,
			};
		},
	},
};
