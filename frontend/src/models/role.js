import { getRoleList, editRole, deleteRole } from '@/services/roleOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'role',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getRoleList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取角色列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editRole, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改角色失败!');
				return;
			} else {
				message.success('修改角色成功!');
			}

			const response = yield call(getRoleList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取角色列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteRole, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除角色失败!');
				return;
			} else {
				message.success('删除角色成功!');
			}

			const response = yield call(getRoleList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取角色列表数据失败!');
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
				data: payload.roles,
				total: payload.total,
			};
		},
	}
};
