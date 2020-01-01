import { getThirdPartyServiceList, editThirdPartyService, deleteThirdPartyService
	} from '@/services/interfaceOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'interfaceApi',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getThirdPartyServiceList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取第三方接口列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editThirdPartyService, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改第三方接口失败!');
				return;
			} else {
				message.success('修改第三方接口成功!');
			}

			const response = yield call(getThirdPartyServiceList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取第三方接口列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteThirdPartyService, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除第三方接口失败!');
				return;
			} else {
				message.success('删除第三方接口成功!');
			}

			const response = yield call(getThirdPartyServiceList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取第三方接口列表数据失败!');
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
				data: payload.interfaces,
				total: payload.total,
			};
		},
	}
};
