import { getEntitySegmentList, editEntitySegment, deleteEntitySegment,
	getDiseaseSystemList } from '@/services/entitySegmentOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'entitySegment',

	state: {
		data: [],
		total: 0,
		systemOptions: [],
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(getEntitySegmentList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取症状片段列表数据失败!');
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

			let data = buildOptionsByTags(response0.data.disease_systems, 'name', 'id');
			yield put({
				type: 'saveOptions',
				payload: data,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getEntitySegmentList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取症状片段列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editEntitySegment, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改症状片段失败!');
				return;
			} else {
				message.success('修改症状片段成功!');
			}

			const response = yield call(getEntitySegmentList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取症状片段列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteEntitySegment, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除症状片段失败!');
				return;
			} else {
				message.success('删除症状片段成功!');
			}

			const response = yield call(getEntitySegmentList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取症状片段列表数据失败!');
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
				data: payload.segments,
				total: payload.total,
			};
		},

		saveOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				systemOptions: payload,
			};
		},
	}
};
