import { getUserList, editUser, deleteUser } from '@/services/userOps';
import { getRoleList } from '@/services/roleOps';
import { getOrganizationList } from '@/services/organizationOps';
import { getDepartmentList } from '@/services/departmentOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'userBB',

	state: {
		data: [],
		total: 0,
		roleOptions: [],
		orgOptions: [],
		departmentOptions: [],
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(getUserList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取用户列表数据失败!');
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

			let data0 = buildOptionsByTags(response0.data.orgs, 'name', 'code');
			yield put({
				type: 'saveOrgOptions',
				payload: data0,
			});

			const response1 = yield call(getRoleList, {page:1, pageSize:1000});
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取角色列表数据失败!');
				return;
			}

			let data1 = buildOptionsByTags(response1.data.roles, 'name', 'id');
			yield put({
				type: 'saveRoleOptions',
				payload: data1,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getUserList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取用户列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editUser, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改用户失败!');
				return;
			} else {
				message.success('修改用户成功!');
			}

			const response = yield call(getUserList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取用户列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteUser, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除用户失败!');
				return;
			} else {
				message.success('删除用户成功!');
			}

			const response = yield call(getUserList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取用户列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*queryDepartments({payload, callback}, {call, put}) {
			const response = yield call(getDepartmentList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取科室列表数据失败!');
				return;
			}

			let data = buildOptionsByTags(response.data.departments, ['name','code'], 'id');
			yield put({
				type: 'saveDepartmentOptions',
				payload: data,
			});
		},
	},

	reducers: {
		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.users,
				total: payload.total,
			};
		},

		saveOrgOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				orgOptions: payload,
			};
		},

		saveRoleOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				roleOptions: payload,
			};
		},

		saveDepartmentOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				departmentOptions: payload,
			};
		},
	}
};
