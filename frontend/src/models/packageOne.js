import { getPackageOne, editPackageOne, getTemplatePreview,
	queryEntitySegment, queryPhysicalSegment, getPackageList, getSmartPackageByDiseaseName }
	from '@/services/packageOps';
import { message } from 'antd';
import * as Utils from '../utils/packageTemplateUtils';

export default {
	namespace: 'packageOne',

	state: {
		data: {},
	},

	effects: {
		*fetch({payload, callback}, { call, put }) {
			if(payload.id != '0') {
				const response = yield call(getPackageOne, payload.id);
				if (!response.code || response.code != 'SUCCESS') {
					message.error('获取疾病模板数据失败!');
					return;
				}
				callback(response.data);
			} else {
				let x = {
					disease: payload.diseaseId,
					virtualdept: payload.virtualDeptId,
				};
				const response = yield call(getSmartPackageByDiseaseName, x);
				if (!response.code || response.code != 'SUCCESS') {
					message.error('获取疾病模板数据失败!');
					return;
				}
				callback(response.data);
			}
		},

		*fetchPackageList({payload, callback}, { call, put }) {
			const response = yield call(getPackageList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病模板列表数据失败!');
				return;
			}
			callback(response.data);
		},

		*querySymptom({payload, callback}, { call, put }) {
			const response = yield call(queryEntitySegment, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('查询症状数据失败!');
				return;
			}

			let options = Utils.buildSymptomData(response.data.segments);
			callback(options);
		},

		*queryItem({payload, callback}, { call, put }) {
			const response = yield call(queryPhysicalSegment, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('查询体格检查片段数据失败!');
				return;
			}

			let options = Utils.buildItemData(response.data.segments);
			callback(options);
		},

		*getPreview({payload, callback}, { call, put }) {
			const response = yield call(getTemplatePreview, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取预览数据失败!');
				return;
			}

			callback(response.data);
		},

		*editPackage({payload, callback}, { call, put }) {
			const response = yield call(editPackageOne, payload);
			if (response.code && response.code == 'SUCCESS'){
				callback(true, null);
				return;
			}

			if (!response.code || response.code == 'FAILURE') {
				message.error('更新疾病模板数据失败!');
				return;
			}

			if (response.code != 'DISEASE_PACKAGE_EXIST') {
				message.error('更新疾病模板数据失败!');
				return;
			}
			const response0 = yield call(getPackageOne, response.data.diseasePackageId);
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取现有疾病模板数据失败!');
				return;
			}
			callback(false, response0.data);
		},
	},

	reducers: {
		saveTemplates(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload,
			};
		},
	},
};

