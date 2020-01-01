import { getVirtualDepartmentList, editVirtualDepartment, deleteVirtualDepartment,
	getVirtualDepartmentOne } from '@/services/virtualDepartmentOps';
import { getDepartmentList } from '@/services/departmentOps';
import { getUserList } from '@/services/userOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'virtualDepartment',

	state: {
		data: [],
		total: 0,
		departmentOptions: [],
		userOptions: []
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(getVirtualDepartmentList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取虚拟组数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});

			const response0 = yield call(getDepartmentList, {});
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取机构列表数据失败!');
				return;
			}
			let data0 = buildOptionsByTags(response0.data.departments, ['org_name', 'name', 'code'], 'id');
			yield put({
				type: 'saveDepartmentOptions',
				payload: data0,
			});

			const response1 = yield call(getUserList, {});
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取用户数据失败!');
				return;
			}
			let data1 = buildOptionsByTags(response1.data.users, ['org_name', 'name'], 'id');
			yield put({
				type: 'saveUserOptions',
				payload: data1,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getVirtualDepartmentList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取虚拟组列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editVirtualDepartment, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改虚拟组失败!');
				return;
			} else {
				message.success('修改虚拟组成功!');
			}

			const response = yield call(getVirtualDepartmentList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取虚拟组列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteVirtualDepartment, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除虚拟组失败!');
				return;
			} else {
				message.success('删除虚拟组成功!');
			}

			const response = yield call(getVirtualDepartmentList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取虚拟组列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*load({payload, callback}, {call, put}) {
			const response = yield call(getVirtualDepartmentOne, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取虚拟组列表数据失败!');
				return;
			}
			callback(response.data);
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

		saveDepartmentOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				departmentOptions: payload,
			};
		},

		saveUserOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				userOptions: payload,
			};
		},
	}
};

