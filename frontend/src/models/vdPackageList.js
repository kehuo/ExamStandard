import { getVDPackageList, deleteVDPackageOne } from '@/services/vdPackageOps';
import { message } from 'antd';

export default {
	namespace: 'vdPackageList',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, { call, put }) {
			const response = yield call(getVDPackageList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取虚拟组模板列表数据失败!');
				return;
			}

			yield put({
				type: 'savePackages',
				payload: response.data,
			});
		},

		*delete({payload, callback}, { call, put }) {
			const rs0 = yield call(deleteVDPackageOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除虚拟组模板状态失败!');
				return;
			} else {
				message.success('删除虚拟组模板状态成功!');
			}

			const response = yield call(getVDPackageList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取虚拟组模板列表数据失败!');
				return;
			}

			yield put({
				type: 'savePackages',
				payload: response.data,
			});
		},
	},

	reducers: {
		savePackages(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.packages,
				total: payload.total,
			};
		},
	}
};
