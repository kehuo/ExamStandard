import { getStdMedicineList, getStdMedicineOne, editStdMedicine, deleteStdMedicine } from '@/services/medicineOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'stdMedicineList',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getStdMedicineList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取标准药品列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editStdMedicine, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改标准药品失败!');
				return;
			} else {
				message.success('修改标准药品成功!');
			}

			const response = yield call(getStdMedicineList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取标准药品列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteStdMedicine, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除标准药品失败!');
				return;
			} else {
				message.success('删除标准药品成功!');
			}

			const response = yield call(getStdMedicineList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取标准药品列表数据失败!');
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
	}
};
