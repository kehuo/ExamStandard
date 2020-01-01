import { getModelList, editModel, deleteModel } from '@/services/modelOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'model',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getModelList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取模型列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editModel, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改模型失败!');
				return;
			} else {
				message.success('修改模型成功!');
			}

			const response = yield call(getModelList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取模型列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteModel, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除模型失败!');
				return;
			} else {
				message.success('删除模型成功!');
			}

			const response = yield call(getModelList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取模型列表数据失败!');
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
				data: payload.models,
				total: payload.total,
			};
		},
	}
};
