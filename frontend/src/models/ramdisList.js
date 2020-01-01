import { getRamdisList } from '@/services/ramdisOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'ramdisList',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getRamdisList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取数据源列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});

			if(callback) {
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
