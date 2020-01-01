import { getLoincObjMappingList, editLoincObjMappingOne, deleteLoincObjMappingOne } from '@/services/loincMappingOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'loincObjMappingList',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getLoincObjMappingList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取LoincObj列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editLoincObjMappingOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改LoincObj映射失败!');
				return;
			} else {
				message.success('修改LoincObj映射成功!');
			}

			const response = yield call(getLoincObjMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取LoincObj映射列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteLoincObjMappingOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除LoincObj映射失败!');
				return;
			} else {
				message.success('删除LoincObj映射成功!');
			}

			const response = yield call(getLoincObjMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取LoincObj映射列表数据失败!');
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
				data: payload.items,
				total: payload.total,
			};
		},
	}
};
