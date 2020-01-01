import { getDoctorTemplateList } from '@/services/packageOps';
import { getOrganizationList } from '@/services/organizationOps';
import { getOperatorList } from '@/services/operatorOps';
import { getDiseaseList } from '@/services/diseaseOps';
import { message } from 'antd';

export default {
	namespace: 'doctorTemplate',

	state: {
		data: [],
		total: 0,

		orgOpts: [],
		operatorOpts: [],
		diseaseOpts: [],
	},

	effects: {
		*init({payload, callback}, { call, put }) {
			const response0 = yield call(getOrganizationList, {});
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取机构列表失败!');
				return;
			}

			yield put({
				type: 'saveOrg',
				payload: response0.data,
			});

			const response = yield call(getDoctorTemplateList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取医生模板列表失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*fetch({payload, callback}, { call, put }) {
			const response = yield call(getDoctorTemplateList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取医生模板列表失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*queryOperator({payload, callback}, { call, put }) {
			const response = yield call(getOperatorList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取医生列表失败!');
				return;
			}

			yield put({
				type: 'saveOperator',
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

		saveOrg(state, action) {
			let payload = action.payload;
			return {
				...state,
				orgOpts: payload.orgs,
			};
		},

		saveOperator(state, action) {
			let payload = action.payload;
			return {
				...state,
				operatorOpts: payload.operators,
			};
		},

		saveDisease(state, action) {
			let payload = action.payload;
			return {
				...state,
				diseaseOpts: payload.diseases,
			};
		},
	},
};
