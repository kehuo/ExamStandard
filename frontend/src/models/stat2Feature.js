import { getTaggingTaskList, getTaggingTaskOne, editTaggingTaskOne,
	deleteTaggingTaskOne } from '@/services/taggingTaskOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';
import { mockStatData } from '../pages/TrainModel/SurrealModelSub/mockStatData';
import { buildFeatureList } from '../pages/TrainModel/SurrealModelSub/stat2featureUtils';

export default {
	namespace: 'stat2Feature',

	state: {
		statistics: {},
		featuresListMap: {},
	},

	effects: {
		*fetch({payload, callback}, { call, put }) {
			// const response = yield call(getTaggingTaskList, payload);
			// if (!response.code || response.code != 'SUCCESS') {
			// 	message.error('获取标注任务列表数据失败!');
			// 	return;
			// }
			//
			// yield put({
			// 	type: 'saveStat',
			// 	payload: response.data,
			// });

			yield put({
				type: 'saveStat',
				payload: mockStatData,
			});

			if (callback) {
				callback();
			}
		},

		*edit({payload, callback}, {call, put}) {
			const rs0 = yield call(editTaggingTaskOne, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改标注任务信息失败!');
				return;
			} else {
				message.success('修改标注任务信息成功!');
			}

			if(callback) {
				callback();
			}
		},
	},

	reducers: {
		saveStat(state, action) {
			let data = action.payload;
			return {
				...state,
				statistics: data,
				featuresListMap: buildFeatureList(data),
			};
		},
	}
};
