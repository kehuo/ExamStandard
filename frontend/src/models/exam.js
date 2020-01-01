import { getExamList, editExam, deleteExam } from '@/services/examOps';
import { getDataSourceList } from '@/services/dataSourceOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'exam',

	state: {
		data: [],
		total: 0,
		dataSourceOptions: []
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(getExamList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取检查检验列表数据失败!');
				return;
			}
			yield put({
				type: 'saveList',
				payload: response.data,
			});

			const response1 = yield call(getDataSourceList, {page:1, pageSize:100, sourceType:2});
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取检查检验列表数据失败!');
				return;
			}
			let data1 = buildOptionsByTags(response1.data.data_sources, 'source', 'id');
			yield put({
				type: 'saveDataSourceOptions',
				payload: data1,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getExamList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取检查检验列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editExam, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改检查检验失败!');
				return;
			} else {
				message.success('修改检查检验成功!');
			}

			const response = yield call(getExamList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取检查检验列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteExam, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除检查检验失败!');
				return;
			} else {
				message.success('删除检查检验成功!');
			}

			const response = yield call(getExamList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取检查检验列表数据失败!');
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
				data: payload.exams,
				total: payload.total,
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
