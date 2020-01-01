import { getBodyPartList, editBodyPart, deleteBodyPart } from '@/services/bodyPartOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'bodyPart',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getBodyPartList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取身体部位列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editBodyPart, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改身体部位失败!');
				return;
			} else {
				message.success('修改身体部位成功!');
			}

			const response = yield call(getBodyPartList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取身体部位列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteBodyPart, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除身体部位失败!');
				return;
			} else {
				message.success('删除身体部位成功!');
			}

			const response = yield call(getBodyPartList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取身体部位列表数据失败!');
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
				data: payload.body_parts,
				total: payload.total,
			};
		},
	}
};
