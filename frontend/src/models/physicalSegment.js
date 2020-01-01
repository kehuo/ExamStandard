import { queryPhysicalSegment } from '@/services/packageOps';
import { getBodyPartList, editPhysicalSegment, deletePhysicalSegment } from '@/services/physicalSegmentOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'physicalSegment',

	state: {
		data: [],
		total: 0,
		bodyPartOptions: [],
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(queryPhysicalSegment, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病检查关联列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});

			const response0 = yield call(getBodyPartList, {page:1, pageSize:100});
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取器官列表数据失败!');
				return;
			}

			yield put({
				type: 'saveBody',
				payload: buildOptionsByTags(response0.data.body_parts, 'name', 'id'),
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(queryPhysicalSegment, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病检查关联列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editPhysicalSegment, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改体格检查句段失败!');
				return;
			} else {
				message.success('修改体格检查句段成功!');
			}

			const response = yield call(queryPhysicalSegment, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取体格检查句段列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deletePhysicalSegment, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除体格检查句段失败!');
				return;
			} else {
				message.success('删除体格检查句段成功!');
			}

			const response = yield call(queryPhysicalSegment, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取体格检查句段列表数据失败!');
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

		saveBody(state, action) {
			let payload = action.payload;
			return {
				...state,
				bodyPartOptions: payload,
			};
		},
	}
};
