import { getLoincList, editLoincOne } from '@/services/loincOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'loincList',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getLoincList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取LOINC列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});

			if (callback) {
				callback();
			}
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editLoincOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改LOINC失败!');
				return;
			} else {
				message.success('修改LOINC成功!');
			}

			const response = yield call(getLoincList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取LOINC列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});

			if (callback) {
				callback();
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
