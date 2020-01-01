import { getRadlexList, editRadlexOne, getRadlexParentTree } from '@/services/radlexOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'radlexList',

	state: {
		data: [],
		total: 0,
		parentTree: [],
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getRadlexList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取RADLEX列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});

			let parentTree = [];
			if (payload.parent) {
				const response0 = yield call(getRadlexParentTree, payload.parent);
				if (!response0.code || response0.code != 'SUCCESS') {
					message.error('获取RADLEX parent列表数据失败!');
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
			const rs0 = yield call(editRadlexOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改RADLEX失败!');
				return;
			} else {
				message.success('修改RADLEX成功!');
			}

			const response = yield call(getRadlexList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取RADLEX列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});

			let parentTree = [];
			if (payload.queryParams.parent) {
				const response0 = yield call(getRadlexParentTree, payload.queryParams.parent);
				if (!response0.code || response0.code != 'SUCCESS') {
					message.error('获取RADLEX parent列表数据失败!');
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
