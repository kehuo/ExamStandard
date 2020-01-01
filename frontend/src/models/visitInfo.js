import { getVisitInfoList, getVisitInfoOne } from '@/services/visitInfoOps';
import { getOrganizationList } from  '@/services/organizationOps';
import { getDepartmentList } from  '@/services/departmentOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'visitInfo',

	state: {
		data: [],
		total: 0,

		orgOpts: [],
		deptOpts: [],
		detailOne: {}
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response0 = yield call(getOrganizationList, payload);
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取机构列表数据失败!');
				return;
			}

			yield put({
				type: 'saveOrg',
				payload: response0.data,
			});

			const response = yield call(getVisitInfoList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取推送数据列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getVisitInfoList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取推送数据列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*getOne({payload, callback}, {call, put}) {
			const response = yield call(getVisitInfoOne, payload.id);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取推送数据失败!');
				return;
			}

			yield put({
				type: 'saveOne',
				payload: response.data,
			});

			if(callback) {
				callback();
			}
		},

		*queryDepartment({payload, callback}, {call, put}) {
			const response = yield call(getDepartmentList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取科室数据失败!');
				return;
			}

			yield put({
				type: 'saveDepartment',
				payload: response.data,
			});
		},
	},

	reducers: {
		saveOrg(state, action) {
			let payload = action.payload;
			return {
				...state,
				orgOpts: buildOptionsByTags(payload.orgs, 'name', 'code'),
			};
		},

		saveDepartment(state, action) {
			let payload = action.payload;
			let opts = [];
			for (let i=0; i<payload.departments.length; i++) {
				let curD = payload.departments[i];
				opts.push({
					k: curD.name + '-' + curD.code,
					v: curD.code
				});
			}
			return {
				...state,
				deptOpts: opts,
			};
		},

		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.items,
				total: payload.total,
			};
		},

		saveOne(state, action) {
			let payload = action.payload;
			return {
				...state,
				detailOne: payload,
			};
		},
	}
};
