import { getDepartmentList, editDepartment, deleteDepartment } from '@/services/departmentOps';
import { getOrganizationList } from '@/services/organizationOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'department',

	state: {
		data: [],
		total: 0,
		orgOptions: [],
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(getDepartmentList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取科室列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});

			const response0 = yield call(getOrganizationList, {page:1, pageSize:1000});
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取机构列表数据失败!');
				return;
			}

			let data = buildOptionsByTags(response0.data.orgs, 'name', 'code');
			yield put({
				type: 'saveOptions',
				payload: data,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getDepartmentList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取科室列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editDepartment, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改科室失败!');
				return;
			} else {
				message.success('修改科室成功!');
			}

			const response = yield call(getDepartmentList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取科室列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteDepartment, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除科室失败!');
				return;
			} else {
				message.success('删除科室成功!');
			}

			const response = yield call(getDepartmentList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取科室列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},
	},

	reducers: {
		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.departments,
				total: payload.total,
			};
		},

		saveOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				orgOptions: payload,
			};
		},
	}
};
