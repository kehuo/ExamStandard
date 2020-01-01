import { getHeredopathiaHpoList, editHeredopathiaHpo, deleteHeredopathiaHpo
	} from '@/services/heredopathiaHpoOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'heredopathiaHpo',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getHeredopathiaHpoList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取HPO列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editHeredopathiaHpo, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改HPO失败!');
				return;
			} else {
				message.success('修改HPO成功!');
			}

			const response = yield call(getHeredopathiaHpoList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取HPO列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteHeredopathiaHpo, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除HPO失败!');
				return;
			} else {
				message.success('删除HPO成功!');
			}

			const response = yield call(getHeredopathiaHpoList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取HPO列表数据失败!');
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
				data: payload.heredopathias,
				total: payload.total,
			};
		},
	}
};
