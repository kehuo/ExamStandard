import { getDataSourceList, editDataSource, deleteDataSource } from '@/services/dataSourceOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'dataSource',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getDataSourceList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取数据源列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editDataSource, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改数据源失败!');
				return;
			} else {
				message.success('修改数据源成功!');
			}

			const response = yield call(getDataSourceList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取数据源列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteDataSource, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除数据源失败!');
				return;
			} else {
				message.success('删除数据源成功!');
			}

			const response = yield call(getDataSourceList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取数据源列表数据失败!');
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
				data: payload.data_sources,
				total: payload.total,
			};
		},
	}
};
