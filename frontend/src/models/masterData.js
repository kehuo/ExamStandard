import { getMasterDataList, getMasterDataOne, editMasterDataOne,
	deleteMasterDataOne, getMasterDataListSearch, getMasterParentTree,
	getMasterDataFuncTest, getMasterDataFuncGen, getMasterDataOneComplicate,
	getMasterDataOneExtension, createSmartExpand
} from '@/services/masterDataOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'masterData',

	state: {
		parentItem: {},
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			if (payload.parentId) {
				const rs0 = yield call(getMasterDataOne, payload.type, payload.parentId);
				if (!rs0.code || rs0.code != 'SUCCESS') {
					message.error('获取主数据项失败!');
					return;
				}

				yield put({
					type: 'saveItem',
					payload: rs0.data,
				});
			}

			const response = yield call(getMasterDataList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取主数据列表数据失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},

		*getOne({payload, callback}, {call, put}) {
			const response = yield call(getMasterDataOne, payload.type, payload.id);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取主数据项数据失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editMasterDataOne, payload.type, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改主数据失败!');
				return;
			} else {
				message.success('修改主数据成功!');
			}

			const response = yield call(getMasterDataList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取主数据列表数据失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteMasterDataOne, payload.type, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除主数据失败!');
				return;
			} else {
				message.success('删除主数据成功!');
			}

			const response = yield call(getMasterDataList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取主数据列表数据失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},

		*search({payload, callback}, {call, put}) {
			const response = yield call(getMasterDataListSearch, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取主数据搜索列表数据失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},

		*parentTree({payload, callback}, {call, put}) {
			const response = yield call(getMasterParentTree, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取主数据父节点列表数据失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},

		*testFunc({payload, callback}, {call, put}) {
			const response = yield call(getMasterDataFuncTest, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('测试函数失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},

		*genFunc({payload, callback}, {call, put}) {
			const response = yield call(getMasterDataFuncGen, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('生成函数失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},

		*getOneComplicate({payload, callback}, {call, put}) {
			const response = yield call(getMasterDataOneComplicate, payload.type, payload.id);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('主数据复合信息获取失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},

		*getOneExtension({payload, callback}, {call, put}) {
			const response = yield call(getMasterDataOneExtension, payload.type, payload.id);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('主数据扩展信息获取失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},

		*createSmartOne({payload, callback}, {call, put}) {
			const rs0 = yield call(createSmartExpand, payload.type, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('新建主数据(扩展代码)失败!');
				return;
			} else {
				message.success('新建主数据(扩展代码)成功!');
			}

			const response = yield call(getMasterDataList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取主数据列表数据失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
	},

	reducers: {
		saveItem(state, action) {
			let payload = action.payload;
			return {
				...state,
				parentItem: payload,
			};
		},
	}
};
