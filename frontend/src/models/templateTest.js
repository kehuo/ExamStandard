import { getOperatorList } from '@/services/operatorOps';
import { getVirtualDepartmentList } from '@/services/virtualDepartmentOps';
import { getOrganizationList } from '@/services/organizationOps';
import { getDiseaseList } from '@/services/diseaseOps';
import { getTemplateTest } from '@/services/packageOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'templateTest',

	state: {
		orgOptions: [],
		operatorOptions: [],
		diseaseOptions: [],
		result: {}
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(getOrganizationList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取机构列表数据失败!');
				return;
			}

			let data = buildOptionsByTags(response.data.orgs, 'name', 'code');
			yield put({
				type: 'saveOrgList',
				payload: data,
			});
		},

		*queryOperator({payload, callback}, {call, put}) {
			let data = [];
			if (payload.ownerType == 'operator') {
				const response = yield call(getOperatorList, payload);
				if (!response.code || response.code != 'SUCCESS') {
					message.error('获取医生列表数据失败!');
					return;
				}

				data = buildOptionsByTags(response.data.operators, ['operator_id', 'name'], 'id');
			} else if (payload.ownerType == 'department') {
				const response = yield call(getVirtualDepartmentList, payload);
				if (!response.code || response.code != 'SUCCESS') {
					message.error('获取虚拟组数据失败!');
					return;
				}

				data = buildOptionsByTags(response.data.departments, 'name', 'id');
			}
			yield put({
				type: 'saveOperatorList',
				payload: data,
			});
		},

		*queryDisease({payload, callback}, {call, put}) {
			const response = yield call(getDiseaseList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病列表数据失败!');
				return;
			}

			let data = buildOptionsByTags(response.data.diseases, ['code', 'name'], 'id');

			yield put({
				type: 'saveDiseaseList',
				payload: data,
			});
		},

		*generateText({payload, callback}, {call, put}) {
			const response = yield call(getTemplateTest, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取自动生成病历失败!');
				return;
			}

			yield put({
				type: 'saveResult',
				payload: response.data,
			});
		}
	},

	reducers: {
		saveOrgList(state, action) {
			let payload = action.payload;
			return {
				...state,
				orgOptions: payload,
			};
		},

		saveOperatorList(state, action) {
			let payload = action.payload;
			return {
				...state,
				operatorOptions: payload,
			};
		},

		saveDiseaseList(state, action) {
			let payload = action.payload;
			return {
				...state,
				diseaseOptions: payload,
			};
		},

		saveResult(state, action) {
			let payload = action.payload;
			return {
				...state,
				result: payload,
			};
		},
	}
};
