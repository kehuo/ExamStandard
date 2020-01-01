import { getHpoList, editHpo, deleteHpo, getHpoParentTree } from '@/services/hpoOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'hpo',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getHpoList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取HPO列表数据失败!');
				return;
			}

			let second = null;
			if (payload.parentCode) {
				const rs0 = yield call(getHpoParentTree, {id:payload.parentId});
				if (!rs0.code || rs0.code != 'SUCCESS') {
					message.error('获取HPO父节点数据失败!');
					return;
				}
				second = rs0.data;
			}
			// yield put({
			// 	type: 'saveList',
			// 	payload: response.data,
			// });
			let rstAll = {
				hpos: response.data.hpos,
				total: response.data.total,
			};
			if (second) {
				rstAll.me = second.me;
				rstAll.allParents = second.allParents;
				rstAll.parentTree = second.parentTree;
			}
			if (callback) {
				callback(rstAll);
			}
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editHpo, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改HPO失败!');
				return;
			} else {
				message.success('修改HPO成功!');
			}

			const response = yield call(getHpoList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取HPO列表数据失败!');
				return;
			}

			// yield put({
			// 	type: 'saveList',
			// 	payload: response.data,
			// });
			if (callback) {
				callback(response.data);
			}
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteHpo, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除HPO失败!');
				return;
			} else {
				message.success('删除HPO成功!');
			}

			const response = yield call(getHpoList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取HPO列表数据失败!');
				return;
			}

			// yield put({
			// 	type: 'saveList',
			// 	payload: response.data,
			// });
			if (callback) {
				callback(response.data);
			}
		},
	},

	reducers: {
		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.hpos,
				total: payload.total,
			};
		},
	}
};
