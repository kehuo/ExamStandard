import { getTrackAuthLogList } from '@/services/trackAuthLogOps';
import { getOrganizationList } from '@/services/organizationOps';
import { getDepartmentList } from '@/services/departmentOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'exportNlp',

	state: {
		data: [],
		total: 0,

		orgOpts: [],
		departmentOpts: []
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(getTrackAuthLogList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取跟踪记录列表数据失败!');
				return;
			}
			yield put({
				type: 'saveList',
				payload: response.data,
			});

			const response1 = yield call(getOrganizationList, {page:1, pageSize:200});
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取机构列表数据失败!');
				return;
			}
			let data1 = buildOptionsByTags(response1.data.orgs, 'name', 'code');
			yield put({
				type: 'saveOrgOpts',
				payload: data1,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getTrackAuthLogList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取跟踪记录列表数据失败!');
				return;
			}
			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*queryDepartments({payload, callback}, {call, put}) {
			const response = yield call(getDepartmentList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取科室列表数据失败!');
				return;
			}

			let data1 = buildOptionsByTags(response.data.departments, 'name', 'code');
			yield put({
				type: 'saveDepartmentOpts',
				payload: data1,
			});
		},
	},

	reducers: {
		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.items,
				total: payload.total,
			};
		},

		saveOrgOpts(state, action) {
			let payload = action.payload;
			return {
				...state,
				orgOpts: payload,
			};
		},

		saveDepartmentOpts(state, action) {
			let payload = action.payload;
			return {
				...state,
				departmentOpts: payload,
			};
		},
	}
};
