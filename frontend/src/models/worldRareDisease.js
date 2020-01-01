import { getWorldRareDiseaseList, editWorldRareDisease, deleteWorldRareDisease } from '@/services/rareDiseaseOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'worldRareDisease',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getWorldRareDiseaseList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取世界罕见病列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editWorldRareDisease, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改世界罕见病失败!');
				return;
			} else {
				message.success('修改世界罕见病成功!');
			}

			const response = yield call(getWorldRareDiseaseList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取世界罕见病列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteWorldRareDisease, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除世界罕见病失败!');
				return;
			} else {
				message.success('删除世界罕见病成功!');
			}

			const response = yield call(getWorldRareDiseaseList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取世界罕见病列表数据失败!');
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
				data: payload.rareDiseases,
				total: payload.total,
			};
		},
	}
};
