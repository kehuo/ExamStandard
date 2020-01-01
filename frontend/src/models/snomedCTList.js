import { getSnomedCTList, editSnomedCTOne, getSnomedCTOne, getSnomedCTOneByCode } from '@/services/snomedCTOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'snomedCTList',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getSnomedCTList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取SNOMED-CT列表数据失败!');
				return;
			}
			yield put({
				type: 'saveList',
				payload: response.data,
			});

			const res1 = yield call(getSnomedCTOneByCode, payload.parent);
			if (!res1.code || res1.code != 'SUCCESS') {
				message.error('获取SNOMED-CT失败!');
				return;
			}
			if (callback) {
				callback(res1.data);
			}
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editSnomedCTOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改SNOMED-CT失败!');
				return;
			} else {
				message.success('修改SNOMED-CT成功!');
			}

			const response = yield call(getSnomedCTList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取SNOMED-CT列表数据失败!');
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
