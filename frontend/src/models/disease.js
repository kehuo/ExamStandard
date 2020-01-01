import { getDiseaseList, editDisease, deleteDisease } from '@/services/diseaseOps';
import { getDiseaseSystemList } from '@/services/diseaseSystemOps';
import { getDataSourceList } from '@/services/dataSourceOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'disease',

	state: {
		data: [],
		total: 0,
		diseaseSystemOptions: [],
		dataSourceOptions: [],
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(getDiseaseList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});

			const response0 = yield call(getDiseaseSystemList, {page:1, pageSize:100});
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取疾病系统列表数据失败!');
				return;
			}

			let data0 = buildOptionsByTags(response0.data.disease_systems, 'name', 'id');
			yield put({
				type: 'saveDiseaseSystemOptions',
				payload: data0,
			});

			const response1 = yield call(getDataSourceList, {page:1, pageSize:100, sourceType:1});
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取数据源列表数据失败!');
				return;
			}

			let data1 = buildOptionsByTags(response1.data.data_sources, 'source', 'id');
			yield put({
				type: 'saveDataSourceOptions',
				payload: data1,
			});

		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getDiseaseList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editDisease, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改疾病信息失败!');
				return;
			} else {
				message.success('修改疾病信息成功!');
			}

			const response = yield call(getDiseaseList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteDisease, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除疾病信息失败!');
				return;
			} else {
				message.success('删除疾病信息成功!');
			}

			const response = yield call(getDiseaseList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病列表数据失败!');
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
				data: payload.diseases,
				total: payload.total,
			};
		},

		saveDiseaseSystemOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				diseaseSystemOptions: payload,
			};
		},

		saveDataSourceOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				dataSourceOptions: payload,
			};
		},
	}
};
