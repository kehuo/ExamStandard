import { getRamdisOne, editRamdisOne } from '@/services/ramdisOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'ramdisOne',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getRamdisOne, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取数据源列表数据失败!');
				return;
			}

			if (callback) {
				callback(response.data);
			}
		},

		*update({payload, callback}, {call, put}) {
			const rs0 = yield call(editRamdisOne, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改病历库失败!');
				return;
			} else {
				message.success('修改病历库成功!');
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
