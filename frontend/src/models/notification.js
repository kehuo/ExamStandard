import { getNotificationList, editNotification, deleteNotification } from '@/services/notificationOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'notification',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getNotificationList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取通知列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editNotification, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改通知失败!');
				return;
			} else {
				message.success('修改通知成功!');
			}

			const response = yield call(getNotificationList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取通知列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteNotification, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除通知失败!');
				return;
			} else {
				message.success('删除通知成功!');
			}

			const response = yield call(getNotificationList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取通知列表数据失败!');
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
				data: payload.notifications,
				total: payload.total,
			};
		},
	}
};
