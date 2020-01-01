import { getTypeList, getRecordsList, getStructure } from '@/services/demoOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'demoStructure',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getTypeList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取信息类型列表数据失败!');
				return;
			}

			if (callback) {
				callback(response.data);
			}
		},

		*getTitleList({payload, callback}, {call, put}) {
			const response = yield call(getRecordsList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取信息标题列表失败!');
				return;
			}

			if (callback) {
				callback(response.data);
			}
		},

		*getStructure({payload, callback}, {call, put}) {
			const response = yield call(getStructure, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取格式化数据失败!');
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
				data: payload.body_parts,
				total: payload.total,
			};
		},
	}
};
