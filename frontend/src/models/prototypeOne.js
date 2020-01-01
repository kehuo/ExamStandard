import { getPrototypeOne } from '@/services/prototypeOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'prototypeOne',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getPrototypeOne, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取数据源列表数据失败!');
				return;
			}

			if (callback) {
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
