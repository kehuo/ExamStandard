import { getLoincList } from '@/services/loincOps';
import { getLoincStep0MappingList, editLoincStep0MappingOne, deleteLoincStep0MappingOne } from '@/services/loincMappingOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'loincStep0MappingList',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getLoincStep0MappingList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取LOINC STEP0列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editLoincStep0MappingOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改LOINC STEP0映射失败!');
				return;
			} else {
				message.success('修改LOINC STEP0映射成功!');
			}

			const response = yield call(getLoincStep0MappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取LOINC STEP0映射列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteLoincStep0MappingOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除LOINC STEP0映射失败!');
				return;
			} else {
				message.success('删除LOINC STEP0映射成功!');
			}

			const response = yield call(getLoincStep0MappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取LOINC STEP0映射列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*queryLoinc({payload, callback}, {call, put}) {
			const response = yield call(getLoincList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取LOINC列表数据失败!');
				return;
			}

			if(callback) {
				callback(response.data);
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
