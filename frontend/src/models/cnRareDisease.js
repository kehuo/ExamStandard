import { getCnRareDiseaseList, editCnRareDisease, deleteCnRareDisease } from '@/services/rareDiseaseOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'cnRareDisease',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getCnRareDiseaseList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取中国罕见病列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editCnRareDisease, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改中国罕见病失败!');
				return;
			} else {
				message.success('修改中国罕见病成功!');
			}

			const response = yield call(getCnRareDiseaseList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取中国罕见病列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteCnRareDisease, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除中国罕见病失败!');
				return;
			} else {
				message.success('删除中国罕见病成功!');
			}

			const response = yield call(getCnRareDiseaseList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取中国罕见病列表数据失败!');
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
				data: payload.cnRareDiseases,
				total: payload.total,
			};
		},
	}
};
