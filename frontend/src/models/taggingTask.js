import { getTaggingTaskList, getTaggingTaskOne, editTaggingTaskOne,
	deleteTaggingTaskOne } from '@/services/taggingTaskOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'taggingTask',

	state: {
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, { call, put }) {
			const response = yield call(getTaggingTaskList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取标注任务列表数据失败!');
				return;
			}

			if(callback) {
				callback(response.data);
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

		*delete({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteTaggingTaskOne, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除标注任务失败!');
				return;
			} else {
				message.success('删除标注任务成功!');
			}

			const response = yield call(getTaggingTaskList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取标注任务列表数据失败!');
				return;
			}

			if(callback) {
				callback(response.data);
			}
		},

		*getOne({payload, callback}, {call, put}) {
			const rs0 = yield call(getTaggingTaskOne, payload.id);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('获取标注任务信息失败!');
				return;
			} else {
				message.success('获取标注任务信息成功!');
			}

			if(callback) {
				callback(rs0.data);
			}
		},
	},

	reducers: {
		savePackages(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.tasks,
				total: payload.total,
			};
		},
	}
};
