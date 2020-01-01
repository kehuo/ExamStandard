import { getFMAList, editFMAOne, getFMAParentTree } from '@/services/fmaOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'fmaList',

	state: {
		data: [],
		total: 0,
		parentTree: [],
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getFMAList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取FMA列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});

			let parentTree = [];
			if (payload.parent) {
				const response0 = yield call(getFMAParentTree, payload.parent);
				if (!response0.code || response0.code != 'SUCCESS') {
					message.error('获取FMA parent列表数据失败!');
					return;
				}
				parentTree = response0.data;
			}
			yield put({
				type: 'saveParentTree',
				payload: parentTree,
			});

			if (callback) {
				callback();
			}
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editFMAOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改FMA失败!');
				return;
			} else {
				message.success('修改FMA成功!');
			}

			const response = yield call(getFMAList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取FMA列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});

			let parentTree = [];
			if (payload.queryParams.parent) {
				const response0 = yield call(getFMAParentTree, payload.queryParams.parent);
				if (!response0.code || response0.code != 'SUCCESS') {
					message.error('获取FMA parent列表数据失败!');
					return;
				}
				parentTree = response0.data;
			}
			yield put({
				type: 'saveParentTree',
				payload: parentTree,
			});


			if (callback) {
				callback();
			}
		},
	},

	reducers: {
		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.items,
				total: payload.total,
			};
		},

		saveParentTree(state, action) {
			let payload = action.payload;
			return {
				...state,
				parentTree: payload,
			};
		},
	}
};
