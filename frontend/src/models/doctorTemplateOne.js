import { getDoctorTemplateOne, getTemplateUpdateStatusList,
	getSmartPackageByDiseaseName } from '@/services/packageOps';
import { getVirtualDepartmentList } from '@/services/virtualDepartmentOps';
import { getDiseaseList } from '@/services/diseaseOps';
import { mergeTemplateOne } from '@/services/templates';

import { message } from 'antd';

export default {
	namespace: 'doctorTemplateOne',

	state: {
		template: {},
		history: [],

		vdOpts: [],
		diseaseOpts: [],
		vdTemplate: {},
	},

	effects: {
		*init({payload, callback}, { call, put }) {
			const response0 = yield call(getVirtualDepartmentList, {});
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取虚拟组列表失败!');
				return;
			}

			yield put({
				type: 'saveVDOpts',
				payload: response0.data,
			});

			const response = yield call(getDoctorTemplateOne, payload.id);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取医生模板失败!');
				return;
			}

			let curTemplate = response.data;
			yield put({
				type: 'saveDoctorTemplate',
				payload: curTemplate,
			});

			let historyParams = {
				page: 1,
				pageSize: 5,
				org: curTemplate['org_code'],
				operator: curTemplate['operator_code'],
				disease: curTemplate['diagnosis_code'],
			};
			const response1 = yield call(getTemplateUpdateStatusList, historyParams);
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取医生模板演进历史列表失败!');
				return;
			}
			yield put({
				type: 'saveHistory',
				payload: response1.data,
			});
		},

		*loadVDTemplate({payload, callback}, { call, put }) {
			const response = yield call(getSmartPackageByDiseaseName, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取医生模板列表失败!');
				return;
			}

			yield put({
				type: 'saveVDTemplate',
				payload: response.data,
			});
		},

		*queryDisease({payload, callback}, { call, put }) {
			const response = yield call(getDiseaseList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病列表失败!');
				return;
			}

			yield put({
				type: 'saveDisease',
				payload: response.data,
			});
		},

		*transfer({payload, callback}, { call, put }) {
			const response = yield call(mergeTemplateOne, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('更新科室模板失败!');
				return;
			}

			yield put({
				type: 'transferTemplate',
				payload: response.data,
			});

			callback(response.data);
			message.success('成功更新科室模板!');
		},
	},

	reducers: {
		saveDoctorTemplate(state, action) {
			let payload = action.payload;
			return {
				...state,
				template: payload,
			};
		},

		saveHistory(state, action) {
			let payload = action.payload;
			return {
				...state,
				history: payload.items,
			};
		},

		saveVDOpts(state, action) {
			let payload = action.payload;
			return {
				...state,
				vdOpts: payload.departments,
			};
		},

		saveDisease(state, action) {
			let payload = action.payload;
			return {
				...state,
				diseaseOpts: payload.diseases,
			};
		},

		saveVDTemplate(state, action) {
			let payload = action.payload;
			return {
				...state,
				vdTemplate: payload,
			};
		},
	},
};
