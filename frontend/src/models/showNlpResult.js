import { getTrackAuthLogList, getTrackAuthLogOneNlp } from '@/services/trackAuthLogOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'showNlpResult',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(getTrackAuthLogList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取跟踪记录列表数据失败!');
				return;
			}
			if (response.data.items.length == 0) {
				return;
			}

			let latestOne = response.data.items[0];
			let params = {
				id: latestOne['id'],
				mode: 'structure'
			};
			const response1 = yield call(getTrackAuthLogOneNlp, params);
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
