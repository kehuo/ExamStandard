import { message } from 'antd';
import { getVectorMappingList, getPropMappingList, getSplitList, getDiscardList, deleteDiscardOne, newDiscardOne, newSplitOne, editSplitOne, deleteSplitOne, newPropMappingOne, editPropMappingOne, deletePropMappingOne, newVectorMappingOne, editVectorMappingOne, deleteVectorMappingOne, getNormTaskList, doNormTaskOne, updateNormTaskOne, emrReferOne, getVectorRef } from '@/services/normalOps';
import { getMasterDataList } from '@/services/masterDataOps';

export default {
	namespace: 'normal',

	state: {
		parentItem: {},
	},

	effects: {
		*getVectorRef({payload, callback}, {call, put}) {
			const response = yield call(getVectorRef, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取参考矢量失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*normTaskFetch({payload, callback}, {call, put}) {
			let params0 = {
				type: 'body_structure',
				page: 1,
				pageSize: 2000
			};
			const response0 = yield call(getMasterDataList, params0);
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取主数据失败!');
				return;
			}
			let params1 = {
				type: 'extension'
			};
			const response1 = yield call(getMasterDataList, params1);
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取扩展属性主数据失败!');
				return;
			}

			const response = yield call(getNormTaskList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量归一任务列表失败!');
				return;
			}


			let data = {
				bodyStructures: response0.data.body_structures,
				extensions: response1.data.extensions,
				normTasks: response.data.normTasks,
				total: response.data.total
			};
			if (callback) {
				callback(data);
			}
		},
		*doNormTask({payload, callback}, {call, put}) {
			const rs0 = yield call(doNormTaskOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('矢量归一任务失败!');
				return;
			} else {
				message.success('矢量归一任务成功!');
			}

			const response = yield call(getNormTaskList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量归一任务列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*updateNormTask({payload, callback}, {call, put}) {
			const rs0 = yield call(updateNormTaskOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('归一任务更新失败!');
				return;
			} else {
				message.success('归一任务更新成功!');
			}

			const response = yield call(getNormTaskList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量归一任务列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*vectorMappingFetch({payload, callback}, {call, put}) {
			let params = {
				type: 'body_structure',
				page: 1,
				pageSize: 2000
			};
			const response0 = yield call(getMasterDataList, params);
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取主数据失败!');
				return;
			}

			const response = yield call(getVectorMappingList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量映射列表失败!');
				return;
			}
			let data = {
				bodyStructures: response0.data.body_structures,
				vectorMapping: response.data.vectorMapping,
				total: response.data.total
			};
			if (callback) {
				callback(data);
			}
		},
		*newVectorMapping({payload, callback}, {call, put}) {
			const rs0 = yield call(newVectorMappingOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('新增矢量映射失败!');
				return;
			} else {
				message.success('新增矢量映射成功!');
			}
			const response = yield call(getVectorMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量映射列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*editVectorMapping({payload, callback}, {call, put}) {
			const rs0 = yield call(editVectorMappingOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('编辑矢量映射失败!');
				return;
			} else {
				message.success('编辑矢量映射成功!');
			}
			const response = yield call(getVectorMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量映射列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*deleteVectorMapping({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteVectorMappingOne, payload.id);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除矢量映射失败!');
				return;
			} else {
				message.success('删除矢量映射成功!');
			}
			const response = yield call(getVectorMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量映射列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*propMappingFetch({payload, callback}, {call, put}) {
			let params = {
				type: 'extension'
			};
			const response0 = yield call(getMasterDataList, params);
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取扩展属性主数据失败!');
				return;
			}
			const response1 = yield call(getPropMappingList, payload);
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取属性映射列表失败!');
				return;
			}
			let data = {
				extensions: response0.data.extensions,
				propMapping: response1.data.propMapping,
				total: response1.data.total
			};

			if (callback) {
				callback(data);
			}

		},
		*splitListFetch({payload, callback}, {call, put}) {
			const response = yield call(getSplitList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量分拆列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*discardListFetch({payload, callback}, {call, put}) {
			const response = yield call(getDiscardList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量丢弃列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*deleteDiscard({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteDiscardOne, payload.id);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除丢弃矢量失败!');
				return;
			} else {
				message.success('删除丢弃矢量成功!');
			}
			const response = yield call(getDiscardList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量丢弃列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*newDiscard({payload, callback}, {call, put}) {
			const rs0 = yield call(newDiscardOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('新增丢弃矢量失败!');
				return;
			} else {
				message.success('新增丢弃矢量成功!');
			}
			const response = yield call(getDiscardList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量丢弃列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*newSplit({payload, callback}, {call, put}) {
			const rs0 = yield call(newSplitOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('新增分拆矢量失败!');
				return;
			} else {
				message.success('新增分拆矢量成功!');
			}
			const response = yield call(getSplitList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量分拆列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*editSplit({payload, callback}, {call, put}) {
			const rs0 = yield call(editSplitOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('编辑分拆矢量失败!');
				return;
			} else {
				message.success('编辑分拆矢量成功!');
			}
			const response = yield call(getSplitList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量分拆列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*deleteSplit({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteSplitOne, payload.id);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除分拆矢量失败!');
				return;
			} else {
				message.success('删除分拆矢量成功!');
			}
			const response = yield call(getSplitList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量分拆列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*newPropMapping({payload, callback}, {call, put}) {
			const rs0 = yield call(newPropMappingOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('新增属性映射失败!');
				return;
			} else {
				message.success('新增属性映射成功!');
			}
			const response = yield call(getPropMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取属性映射列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*editPropMapping({payload, callback}, {call, put}) {
			const rs0 = yield call(editPropMappingOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('编辑属性映射失败!');
				return;
			} else {
				message.success('编辑属性映射成功!');
			}
			const response = yield call(getPropMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取属性映射列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*deletePropMapping({payload, callback}, {call, put}) {
			const rs0 = yield call(deletePropMappingOne, payload.id);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除属性映射失败!');
				return;
			} else {
				message.success('删除属性映射成功!');
			}
			const response = yield call(getPropMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取属性映射列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*masterSearch({payload, callback}, {call, put}) {
			const response = yield call(getPropMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取属性映射列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
		*emrRefer({payload, callback}, {call, put}) {
			const response = yield call(emrReferOne, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取矢量分拆列表失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},
	},

	reducers: {
		savePropMapping(state, action) {
			let payload = action.payload;
			return {
				...state,
				propMapping: payload,
			};
		},
		saveExtensions(state, action) {
			let payload = action.payload;
			return {
				...state,
				extensions: payload,
			};
		}

	}
};
