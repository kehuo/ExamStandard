import { getTestResult } from '@/services/testOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'totalTestPanel',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response1 = yield call(getTestResult, payload);
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取结构化数据失败!');
				return;
			}
			if (callback) {
				callback(response1.data);
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
