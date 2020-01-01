import { getModelVDMappingList, editModelVDMapping, deleteModelVDMapping, getModelVDMappingOne }
	from '@/services/modelVDMappingOps';
import { getVirtualDepartmentList } from '@/services/virtualDepartmentOps';
import { getModelList } from '@/services/modelOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'modelVDMapping',

	state: {
		data: [],
		total: 0,

		virtualDepartments: [],
		models: [],
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response0 = yield call(getVirtualDepartmentList, {page:1, pageSize:100});
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取虚拟组列表数据失败!');
				return;
			}

			yield put({
				type: 'saveVirtualDepartments',
				payload: response0.data,
			});

			const response1 = yield call(getModelList, {page:1, pageSize:100});
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取模型描述列表数据失败!');
				return;
			}

			yield put({
				type: 'saveModels',
				payload: response1.data,
			});

			const response = yield call(getModelVDMappingList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取模型配置列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getModelVDMappingList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取模型配置列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editModelVDMapping, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改模型配置失败!');
				return;
			} else {
				message.success('修改模型配置成功!');
			}

			const response = yield call(getModelVDMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取模型配置列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteModelVDMapping, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除模型配置失败!');
				return;
			} else {
				message.success('删除模型配置成功!');
			}

			const response = yield call(getModelVDMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取模型配置列表数据失败!');
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
				data: payload.mappings,
				total: payload.total,
			};
		},

		saveVirtualDepartments(state, action) {
			let payload = action.payload;
			return {
				...state,
				virtualDepartments: payload.departments,
			};
		},

		saveModels(state, action) {
			let payload = action.payload;
			return {
				...state,
				models: payload.models,
			};
		},
	}
};
