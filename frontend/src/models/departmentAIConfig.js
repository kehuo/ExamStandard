import { getDepartmentAIConfigList, editDepartmentAIConfig, deleteDepartmentAIConfig
	} from '@/services/departmentAIConfigOps';
import { getOrganizationList } from '@/services/organizationOps';
import { getDepartmentList } from '@/services/departmentOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'departmentAiConfig',

	state: {
		data: [],
		total: 0,
		orgOpts: [],
		departmentOpts: []
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response0 = yield call(getDepartmentAIConfigList, payload);
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取科室配置列表失败!');
				return;
			}
			yield put({
				type: 'saveList',
				payload: response0.data,
			});

			const response1 = yield call(getOrganizationList, {});
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取机构列表失败!');
				return;
			}
			yield put({
				type: 'saveOrg',
				payload: response1.data,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getDepartmentAIConfigList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取科室配置列表失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editDepartmentAIConfig, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改科室配置失败!');
				return;
			} else {
				message.success('修改科室配置成功!');
			}

			const response = yield call(getDepartmentAIConfigList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取科室配置列表失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteDepartmentAIConfig, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除科室配置失败!');
				return;
			} else {
				message.success('删除科室配置成功!');
			}

			const response = yield call(getDepartmentAIConfigList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取科室配置列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*fetchDepartment({payload, callback}, {call, put}) {
			const response = yield call(getDepartmentList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取科室列表失败!');
				return;
			}

			yield put({
				type: 'saveDepartment',
				payload: response.data,
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

		saveOrg(state, action) {
			let payload = action.payload;
			let orgs = buildOptionsByTags(payload.orgs, 'name', 'code');
			return {
				...state,
				orgOpts: orgs,
			};
		},

		saveDepartment(state, action) {
			let payload = action.payload;
			let departments = buildOptionsByTags(payload.departments, 'name', 'code');
			return {
				...state,
				departmentOpts: departments,
			};
		},
	}
};
