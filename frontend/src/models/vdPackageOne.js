import { getVDPackageOne, editVDPackage, getVDPackageList} from '@/services/vdPackageOps';
import { getTemplatePreview, queryPhysicalSegment} from '@/services/packageOps';
import { getVirtualDepartmentList } from '@/services/virtualDepartmentOps';
import { message } from 'antd';
import * as Utils from '../utils/packageTemplateUtils';

export default {
	namespace: 'vdPackageOne',

	state: {
		virtualDepartments: [],
	},

	effects: {
		*fetch({payload, callback}, { call, put }) {
			const response0 = yield call(getVirtualDepartmentList, {page:1, pageSize:100});
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取虚拟组列表失败!');
				return;
			}
			yield put({
				type: 'saveVirtualDepartment',
				payload: response0.data,
			});

			if(payload.id != '0') {
				const response = yield call(getVDPackageOne, payload.id);
				if (!response.code || response.code != 'SUCCESS') {
					message.error('获取虚拟组模板数据失败!');
					return;
				}
				callback(response.data);
			} else {
				let emptyPackage = {
					'id': 0,
					'packageId': 0,
					'virtualDepartmentId': '',
					'conditions': '',
					'presentTempId': 0,
					'physicalTempId': 0,
					'pastTempId': 0,
					'familyTempId': 0,
					'allergyTempId': 0,
					'present': {},
					'physical': {
						'category': 'PHYSICAL',
						'type': 'SEG_FORMAT_V2',
						'content': [],
					}
				};
				callback(emptyPackage);
			}
		},

		*fetchPackageList({payload, callback}, { call, put }) {
			const response = yield call(getVDPackageList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取虚拟组模板列表数据失败!');
				return;
			}
			callback(response.data);
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
			const response = yield call(editVDPackage, payload);
			if (response.code && response.code == 'SUCCESS'){
				callback(true, null);
				return;
			}

			if (!response.code || response.code == 'FAILURE') {
				message.error('更新虚拟组模板数据失败!');
				return;
			}

			const response0 = yield call(getVDPackageOne, response.data.diseasePackageId);
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取现有虚拟组模板数据失败!');
				return;
			}
			callback(false, response0.data);
		},
	},

	reducers: {
		saveVirtualDepartment(state, action) {
			let payload = action.payload;
			return {
				...state,
				virtualDepartments: payload.departments,
			};
		},
	},
};
