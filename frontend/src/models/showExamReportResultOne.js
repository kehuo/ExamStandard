// import { getTrackAuthLogList, getTrackAuthLogOneNlp } from '@/services/trackAuthLogOps';
import { getExamReportResultOne } from '@/services/examReportDemo';
import { message } from 'antd';
// import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'showExamReportResultOne',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			const response = yield call(getExamReportResultOne, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('在model函数中, 获取 检查报告结构化+归一化数据 失败!');
				return;
			}
			if (response.data.lossless.length == 0) {
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
				data: payload.data,
				total: payload.total,
			};
		},
	}
};
