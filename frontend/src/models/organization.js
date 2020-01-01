import { getOrganizationList, editOrganization, deleteOrganization,getOrgCertificate,
	getDataSourceList } from '@/services/organizationOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'organization',

	state: {
		data: [],
		total: 0,
		diseaseDataSourceOptions: [],
		examDataSourceOptions: [],
		medicineDataSourceOptions: [],
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(getOrganizationList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取机构列表数据失败!');
				return;
			}
			yield put({
				type: 'saveList',
				payload: response.data,
			});

			const response0 = yield call(getDataSourceList, {page:1, pageSize:1000, sourceType:1});
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取疾病数据源列表数据失败!');
				return;
			}
			let data0 = buildOptionsByTags(response0.data.data_sources, 'source', 'id');
			yield put({
				type: 'saveDiseaseDataSourceOptions',
				payload: data0,
			});

			const response1 = yield call(getDataSourceList, {page:1, pageSize:1000, sourceType:2});
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取检查数据源列表数据失败!');
				return;
			}
			let data1 = buildOptionsByTags(response1.data.data_sources, 'source', 'id');
			yield put({
				type: 'saveExamDataSourceOptions',
				payload: data1,
			});

			const response2 = yield call(getDataSourceList, {page:1, pageSize:1000, sourceType:3});
			if (!response2.code || response2.code != 'SUCCESS') {
				message.error('获取药品数据源列表数据失败!');
				return;
			}

			let data2 = buildOptionsByTags(response2.data.data_sources, 'source', 'id');

			yield put({
				type: 'saveMedicineDataSourceOptions',
				payload: data2,
			});

		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getOrganizationList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取机构列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editOrganization, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改机构失败!');
				return;
			} else {
				message.success('修改机构成功!');
			}

			const response = yield call(getOrganizationList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取机构列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteOrganization, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除机构失败!');
				return;
			} else {
				message.success('删除机构成功!');
			}

			const response = yield call(getOrganizationList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取机构列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*genCode({payload, callback}, {call, put}){
			const response = yield call(getOrgCertificate,payload);
            if (!response.code || response.code != 'SUCCESS') {
	            message.error('获取机构证书失败!');
	            return;
            }

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
				data: payload.orgs,
				total: payload.total,
			};
		},

		saveDiseaseDataSourceOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				diseaseDataSourceOptions: payload,
			};
		},

		saveExamDataSourceOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				examDataSourceOptions: payload,
			};
		},

		saveMedicineDataSourceOptions(state, action) {
			let payload = action.payload;
			return {
				...state,
				medicineDataSourceOptions: payload,
			};
		}
	}
};
