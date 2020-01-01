import { getFeedbackList } from '@/services/feedbackOps';
import { message } from 'antd';

export default {
	namespace: 'feedback',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getFeedbackList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取反馈列表数据失败!');
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
				data: payload.feedbacks,
				total: payload.total,
			};
		},
	}
};
