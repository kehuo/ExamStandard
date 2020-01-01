import { getDiseaseExamMappingList, createDiseaseExamMapping, editDiseaseExamMapping, deleteDiseaseExamMapping,
	getOrgnizationList, getOperatorList, getDiseaseList, getExamList
} from '@/services/diseaseExamMappingOps';
import { getVirtualDepartmentList } from '@/services/virtualDepartmentOps';
import { getDataSourceList } from '@/services/dataSourceOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';


export default {
	namespace: 'diseaseExamMappingList',

	state: {
		data: [],
		total: 0,
		organizations: [],
		virtualDeptOptions: [],
		ownerIdOptions: [],
		diseases: [],
	},

	effects: {
		*init({payload, callback}, { call, put }) {
			let curParamsO = {
				page: 1,
				pageSize: 100,
			};
			const response0 = yield call(getVirtualDepartmentList, curParamsO);
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取虚拟组列表数据失败!');
				return;
			}
			yield put({
				type: 'saveVirtualDeptOptions',
				payload: response0.data.departments,
			});

			if (response0.data.departments.length>0) {
				let curParams1 = {
					page: 1,
					pageSize: 100,
					sourceType: 2,  //exam only
					virtualdept: response0.data.departments[0].id,
				};
				const response1 = yield call(getDataSourceList, curParams1);
				if (!response1.code || response1.code != 'SUCCESS') {
					message.error('获取数据源列表数据失败!');
					return;
				}
				yield put({
					type: 'saveOwnerOptions',
					payload: response1.data.data_sources,
				});
			}

			if(callback) {
				callback();
			}
		},

		*fetch({payload, callback}, { call, put }) {
			const response = yield call(getDiseaseExamMappingList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病检查关联列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*fetchDataSource({payload, callback}, { call, put }) {
			let curParams1 = {
				page: 1,
				pageSize: 100,
				sourceType: 2,  //exam only
				virtualdept: payload.virtualdept,
			};
			const response1 = yield call(getDataSourceList, curParams1);
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取数据源列表数据失败!');
				return;
			}
			yield put({
				type: 'saveOwnerOptions',
				payload: response1.data.data_sources,
			});
		},

		*editMapping({payload, callback}, { call, put }) {
			let params = payload.updateParams;
			if (parseInt(params.id) == 0) {
				const rs0 = yield call(createDiseaseExamMapping, payload.updateParams);
				if (!rs0.code || rs0.code != 'SUCCESS') {
					message.error('创建疾病检查关系失败!');
					return;
				} else {
					message.success('创建疾病检查关系成功!');
				}
			} else {
				const rs0 = yield call(editDiseaseExamMapping, payload.updateParams);
				if (!rs0.code || rs0.code != 'SUCCESS') {
					message.error('修改疾病检查关系失败!');
					return;
				} else {
					message.success('修改疾病检查关系成功!');
				}
			}

			const response = yield call(getDiseaseExamMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病模板列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*deleteMapping({payload, callback}, { call, put }) {
			const rs0 = yield call(deleteDiseaseExamMapping, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除疾病模板状态失败!');
				return;
			} else {
				message.success('删除疾病模板状态成功!');
			}

			const response = yield call(getDiseaseExamMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病模板列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		// *queryOrganization({payload, callback}, { call, put }) {
		// 	let curParams = {
		// 		page: 1,
		// 		pageSize: 200,
		// 		keyword: payload.keyword
		// 	}
		// 	const response = yield call(getOrgnizationList, curParams);
		// 	if (!response.code || response.code != 'SUCCESS') {
		// 		message.error('获取机构列表数据失败!');
		// 		return;
		// 	}
		// 	callback(response.data.orgs);
		// },

		// *queryOperator({payload, callback}, { call, put }) {
		// 	let curParams = {
		// 		page: 1,
		// 		pageSize: 100,
		// 		keyword: payload.keyword
		// 	};
		// 	if (payload.orgCode) {
		// 		curParams.orgCode = payload.orgCode;
		// 	}
		// 	if (payload.type == 'operator') {
		// 		const response = yield call(getOperatorList, curParams);
		// 		if (!response.code || response.code != 'SUCCESS') {
		// 			message.error('获取虚拟组列表数据失败!');
		// 			return;
		// 		}
		// 		// callback(response.data.operators);
		// 		yield put({
		// 			type: 'saveOwnerOptions',
		// 			payload: response.data.operators,
		// 		});
		// 	} else if (payload.type == 'dept') {
		// 		const response = yield call(getVirtualDepartmentList, curParams);
		// 		if (!response.code || response.code != 'SUCCESS') {
		// 			message.error('获取医生列表数据失败!');
		// 			return;
		// 		}
		// 		// callback(response.data.departments);
		// 		yield put({
		// 			type: 'saveOwnerOptions',
		// 			payload: response.data.departments,
		// 		});
		// 	} else {
		// 		message.error('非法类型!');
		// 		return;
		// 	}
		// },

		*queryExam({payload, callback}, { call, put }) {
			const response = yield call(getExamList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取检查列表数据失败!');
				return;
			}
			callback(response.data.exams);
		},

		*queryDisease({payload, callback}, { call, put }) {
			const response = yield call(getDiseaseList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病列表数据失败!');
				return;
			}
			yield put({
				type: 'saveDiseases',
				payload: response.data.diseases,
			});
		},

		*clearDisease({payload, callback}, { call, put }) {
			yield put({
				type: 'saveDiseases',
				payload: [],
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

		saveVirtualDeptOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				virtualDeptOptions: payload,
			};
		},

		saveOwnerOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				ownerIdOptions: payload,
			};
		},

		saveOrganizationOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				organizations: payload,
			};
		},

		saveDiseases(state, action) {
			let payload = action.payload;
			return {
				...state,
				diseases: payload,
			};
		},
	}
};