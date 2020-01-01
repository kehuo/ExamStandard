import { getMedicineMappingList, getMedicineMappingOne, editMedicineMapping, deleteMedicineMapping,
	getStdMedicineList, getOrgMedicineList } from '@/services/medicineOps';
import { getDataSourceList } from '@/services/dataSourceOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'medicineMappingList',

	state: {
		data: [],
		total: 0,
		dataSourceOpts: [],
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response0 = yield call(getDataSourceList, {page:1, pageSize:1000, sourceType:3});
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取数据源列表数据失败!');
				return;
			}

			yield put({
				type: 'saveDataSource',
				payload: response0.data,
			});

			const response = yield call(getMedicineMappingList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取药品映射列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getMedicineMappingList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取药品映射列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editMedicineMapping, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改药品映射失败!');
				return;
			} else {
				message.success('修改药品映射成功!');
			}

			const response = yield call(getMedicineMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取药品映射列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteMedicineMapping, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除药品映射失败!');
				return;
			} else {
				message.success('删除药品映射成功!');
			}

			const response = yield call(getMedicineMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取药品映射列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*queryMedicine({payload, callback}, {call, put}) {
			let func = getOrgMedicineList;
			if (payload.mode == 'standard') {
				func = getStdMedicineList;
			}
			const response = yield call(func, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取药品映表数据失败!');
				return;
			}

			if (callback) {
				let data = buildOptionsByTags(response.data.items, 'name', 'id');
				callback(data);
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

		saveDataSource(state, action) {
			let payload = action.payload;
			return {
				...state,
				dataSourceOpts: buildOptionsByTags(payload.data_sources, 'source', 'id'),
			};
		},
	}
};
