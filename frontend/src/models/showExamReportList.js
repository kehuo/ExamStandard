// 11-14 huoke注释
// <1> 在 services 路径下新建了一个 examReporDemo.js 文件, 用来代替 services/trackAuthLogOps.js
// <2> 不需要 organizationOps 和 departmentOps， 全部注释掉

//import { getTrackAuthLogList } from '@/services/trackAuthLogOps'; 
import { getExamReportList } from '@/services/examReportDemo';
// import { getOrganizationList } from '@/services/organizationOps';
// import { getDepartmentList } from '@/services/departmentOps';
import { message } from 'antd';
// import { buildOptionsByTags } from '../utils/utils';

export default {
	//namespace 是指 models/路径下的 showExamReportList.js 文件中的内容
	namespace: 'showExamReportList',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(getExamReportList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('init检查报告结果列表失败!');
				return;
			}
			yield put({
				type: 'saveList',
				payload: response.data,
			});
		},

		*fetch({payload, callback}, {call, put}) {
			const response = yield call(getExamReportList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('fetch检查报告列表失败!');
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
				data: payload.exam_reports,
				total: payload.total,
			};
		}
	}
};
