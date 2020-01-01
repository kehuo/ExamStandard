import { getRadlexList } from '@/services/radlexOps';
import { getRadlexMappingList, editRadlexMappingOne, deleteRadlexMappingOne } from '@/services/radlexMappingOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'radlexMappingList',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getRadlexMappingList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取身体部位列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editRadlexMappingOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改Radlex映射失败!');
				return;
			} else {
				message.success('修改Radlex映射成功!');
			}

			const response = yield call(getRadlexMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取Radlex映射列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteRadlexMappingOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除Radlex映射失败!');
				return;
			} else {
				message.success('删除Radlex映射成功!');
			}

			const response = yield call(getRadlexMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取Radlex映射列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*queryRadlex({payload, callback}, {call, put}) {
			const response = yield call(getRadlexList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取Radlex列表数据失败!');
				return;
			}

			if(callback) {
				callback(response.data);
			}
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
	}
};
