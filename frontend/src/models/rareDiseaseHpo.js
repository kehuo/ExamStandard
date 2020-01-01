import { getRareDiseaseHpoList, editRareDiseaseHpo, deleteRareDiseaseHpo,
	getRareDiseaseHpoParentTree } from '@/services/rareDiseaseOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'rareDiseaseHpo',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getRareDiseaseHpoList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取罕见病HPO列表数据失败!');
				return;
			}

			let second = null;
			if (payload.parentCode) {
				const rs0 = yield call(getRareDiseaseHpoParentTree, {id:payload.parentId});
				if (!rs0.code || rs0.code != 'SUCCESS') {
					message.error('获取罕见病HPO父节点数据失败!');
					return;
				}
				second = rs0.data;
			}

			let rstAll = {
				hpos: response.data.hpoItems,
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
			const rs0 = yield call(editRareDiseaseHpo, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改罕见病映射失败!');
				return;
			} else {
				message.success('修改罕见病映射成功!');
			}

			const response = yield call(getRareDiseaseHpoList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取罕见病映射列表数据失败!');
				return;
			}

			if (callback) {
				let rstAll = {
					hpos: response.data.hpoItems,
					total: response.data.total,
				};
				callback(rstAll);
			}
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteRareDiseaseHpo, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除罕见病映射失败!');
				return;
			} else {
				message.success('删除罕见病映射成功!');
			}

			const response = yield call(getRareDiseaseHpoList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取罕见病映射列表数据失败!');
				return;
			}

			if (callback) {
				let rstAll = {
					hpos: response.data.hpoItems,
					total: response.data.total,
				};
				callback(rstAll);
			}
		},
	},

	reducers: {
		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.hpoItems,
				total: payload.total,
			};
		},
	}
};
