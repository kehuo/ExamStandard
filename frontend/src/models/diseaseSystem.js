import { getDiseaseSystemList, editDiseaseSystem, deleteDiseaseSystem, getDiseaseSystemOne }
	from '@/services/diseaseSystemOps';
import { getDataSourceList } from '@/services/dataSourceOps';
import { getBodyPartList } from '@/services/bodyPartOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'diseaseSystem',

	state: {
		data: [],
		total: 0,

		dataSources: [],
		bodyParts: [],
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response0 = yield call(getDataSourceList, {page:1, pageSize:100, sourceType:1});
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取数据源列表数据失败!');
				return;
			}

			yield put({
				type: 'saveDataSources',
				payload: response0.data,
			});

			const response1 = yield call(getBodyPartList, {page:1, pageSize:200});
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取部位列表数据失败!');
				return;
			}

			yield put({
				type: 'saveBodyParts',
				payload: response1.data,
			});

			const response = yield call(getDiseaseSystemList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病系统列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getDiseaseSystemList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病系统列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editDiseaseSystem, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改疾病系统失败!');
				return;
			} else {
				message.success('修改疾病系统成功!');
			}

			const response = yield call(getDiseaseSystemList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病系统列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteDiseaseSystem, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除疾病系统失败!');
				return;
			} else {
				message.success('删除疾病系统成功!');
			}

			const response = yield call(getDiseaseSystemList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病系统列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*load({payload, callback}, {call, put}) {
			const response = yield call(getDiseaseSystemOne, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病系统数据失败!');
				return;
			}
			callback(response.data);
		},
	},

	reducers: {
		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.disease_systems,
				total: payload.total,
			};
		},

		saveDataSources(state, action) {
			let payload = action.payload;
			return {
				...state,
				dataSources: payload.data_sources,
			};
		},

		saveBodyParts(state, action) {
			let payload = action.payload;
			return {
				...state,
				bodyParts: payload.body_parts,
			};
		},
	}
};
