import { getAssociatedSymptomList, editAssociatedSymptom, deleteAssociatedSymptom }
	from '@/services/associateSymptomOps';
import { getMasterDataList } from '@/services/masterDataOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'associateSymptom',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getAssociatedSymptomList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取症状关联列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editAssociatedSymptom, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改症状关联失败!');
				return;
			} else {
				message.success('修改症状关联成功!');
			}

			const response = yield call(getAssociatedSymptomList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取症状关联列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteAssociatedSymptom, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除症状关联失败!');
				return;
			} else {
				message.success('删除症状关联成功!');
			}

			const response = yield call(getAssociatedSymptomList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取症状关联列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*fetchSymptom({payload, callback}, {call, put}) {
			const rs0 = yield call(getMasterDataList, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除症状关联失败!');
				return;
			}

			if (callback) {
				callback(rs0.data.symptoms);
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
