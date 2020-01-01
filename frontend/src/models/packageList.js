import { getPackageList, updatePackageStatus, getDiseaseList } from '@/services/packageOps';
import { getVirtualDepartmentList } from '@/services/virtualDepartmentOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';


export default {
	namespace: 'packageList',

	state: {
		data: [],
		total: 0,
		virtualDepartments: [],
	},

	effects: {
		*init({payload, callback}, { call, put }) {
			const response0 = yield call(getVirtualDepartmentList, {page:1, pageSize:50});
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取虚拟组列表数据失败!');
				return;
			}

			let x = buildOptionsByTags(response0.data.departments, 'name', 'id');
			x.push({k:'all', v:''});
			yield put({
				type: 'saveVirtualDepartments',
				payload: x,
			});

			const response = yield call(getPackageList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病模板列表数据失败!');
				return;
			}

			yield put({
				type: 'savePackages',
				payload: response.data,
			});
		},

		*fetch({payload, callback}, { call, put }) {
			const response = yield call(getPackageList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病模板列表数据失败!');
				return;
			}

			yield put({
				type: 'savePackages',
				payload: response.data,
			});
		},
		
		*changeStatus({payload, callback}, { call, put }) {
			const rs0 = yield call(updatePackageStatus, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改疾病模板状态失败!');
				return;
			} else {
				message.success('修改疾病模板状态成功!');
			}

			const response = yield call(getPackageList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病模板列表数据失败!');
				return;
			}

			yield put({
				type: 'savePackages',
				payload: response.data,
			});
		},

		*queryDisease({payload, callback}, { call, put }) {
			const response = yield call(getDiseaseList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病列表数据失败!');
				return;
			}
			let options = buildOptionsByTags(response.data.diseases, 'display', 'id');
			callback(options);
		},
	},

	reducers: {
		savePackages(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.disease_packages,
				total: payload.total,
			};
		},

		saveVirtualDepartments(state, action) {
			let payload = action.payload;
			return {
				...state,
				virtualDepartments: payload,
			};
		},
	}
};