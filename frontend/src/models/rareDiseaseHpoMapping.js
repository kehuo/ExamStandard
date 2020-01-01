import { getRareDiseaseHpoMappingList, editRareDiseaseHpoMapping, deleteRareDiseaseHpoMapping,
	getRareDiseaseHpoList, getWorldRareDiseaseList } from '@/services/rareDiseaseOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'rareDiseaseHpoMapping',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getRareDiseaseHpoMappingList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取罕见病映射列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editRareDiseaseHpoMapping, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改罕见病映射失败!');
				return;
			} else {
				message.success('修改罕见病映射成功!');
			}

			const response = yield call(getRareDiseaseHpoMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取罕见病映射列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteRareDiseaseHpoMapping, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除罕见病映射失败!');
				return;
			} else {
				message.success('删除罕见病映射成功!');
			}

			const response = yield call(getRareDiseaseHpoMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取罕见病映射列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*queryHpo({payload, callback}, {call, put}) {
			const response = yield call(getRareDiseaseHpoList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取HPO列表数据失败!');
				return;
			}

			if(callback) {
				let data = buildOptionsByTags(response.data.hpoItems, 'cnName', 'id');
				callback(data);
			};
		},

		*queryWorldRareDisease({payload, callback}, {call, put}) {
			const response = yield call(getWorldRareDiseaseList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取世界罕见病列表数据失败!');
				return;
			}

			if(callback) {
				let data = buildOptionsByTags(response.data.rareDiseases, ['dbName','cnName','enName'], 'id');
				callback(data);
			};
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
