import { getOrgMedicineList, getOrgMedicineOne, editOrgMedicine, deleteOrgMedicine } from '@/services/medicineOps';
import { getDataSourceList } from '@/services/dataSourceOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'orgMedicineList',

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

			const response = yield call(getOrgMedicineList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取机构药品列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getOrgMedicineList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取机构药品列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editOrgMedicine, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改机构药品失败!');
				return;
			} else {
				message.success('修改机构药品成功!');
			}

			const response = yield call(getOrgMedicineList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取机构药品列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteOrgMedicine, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除机构药品失败!');
				return;
			} else {
				message.success('删除机构药品成功!');
			}

			const response = yield call(getOrgMedicineList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取机构药品列表数据失败!');
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
