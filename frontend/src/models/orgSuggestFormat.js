import { getOrgSuggestFormatList, editOrgSuggestFormat, deleteOrgSuggestFormat,
	getOrgSuggestFormatCandidates } from '@/services/orgSuggestFormatOps';
import { getOrganizationList } from '@/services/organizationOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'orgSuggestFormat',

	state: {
		data: [],
		total: 0,
		orgOpts: [],
		contentOptions: {},
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(getOrgSuggestFormatList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取机构推荐数据格式列表数据失败!');
				return;
			}
			yield put({
				type: 'saveList',
				payload: response.data,
			});

			const response0 = yield call(getOrgSuggestFormatCandidates);
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取推荐数据格式列表失败!');
				return;
			}
			yield put({
				type: 'saveFormat',
				payload: response0.data,
			});

			const response1 = yield call(getOrganizationList, {});
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取机构列表失败!');
				return;
			}
			yield put({
				type: 'saveOrg',
				payload: response1.data,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getOrgSuggestFormatList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取机构推荐数据格式列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editOrgSuggestFormat, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改机构推荐数据格式失败!');
				return;
			} else {
				message.success('修改机构推荐数据格式成功!');
			}

			const response = yield call(getOrgSuggestFormatList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取机构推荐数据格式列表数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteOrgSuggestFormat, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除机构推荐数据格式失败!');
				return;
			} else {
				message.success('删除机构推荐数据格式成功!');
			}

			const response = yield call(getOrgSuggestFormatList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取机构推荐数据格式列表数据失败!');
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

		saveFormat(state, action) {
			let payload = action.payload;
			let tags = ['examOrder', 'diagnosis', 'prescription', 'referral'];
			let x = {};
			for (let i=0; i<tags.length; i++) {
				let k = tags[i];
				let names = payload[k];
				let opts = [];
				for (let j=0; j<names.length; j++) {
					opts.push({
						k: names[j], v: names[j]
					});
				}
				x[k] = opts;
			}
			return {
				...state,
				contentOptions: x,
			};
		},

		saveOrg(state, action) {
			let payload = action.payload;
			let orgs = buildOptionsByTags(payload.orgs, 'name', 'code');
			return {
				...state,
				orgOpts: orgs,
			};
		},
	}
};
