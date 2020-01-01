import { getTrainingTaskList, editTrainingTask, deleteTrainingTask, getTrainingTask,
	getTrainDataList, editTrainingData, deleteTrainingData,
	getTrainTaskLog, postTrainingTaskOp, getTrainingTaskPerformance
} from '@/services/trainingTaskOps';
import { message } from 'antd';

export default {
	namespace: 'trainTask',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetchTaskList({payload, callback}, { call, put }) {
			const response = yield call(getTrainingTaskList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取模型训练任务列表数据失败!');
				return;
			}

			if (callback) {
				callback(response.data);
			}
		},

		*editTaskOne({payload, callback}, { call, put }) {
			const rs0 = yield call(editTrainingTask, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改模型训练任务失败!');
				return;
			} else {
				message.success('修改模型训练任务成功!');
			}

			if (callback) {
				callback(rs0.data.id);
			}
		},

		*getTaskOne({payload, callback}, { call, put }) {
			const rs0 = yield call(getTrainingTask, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('获取模型训练任务失败!');
				return;
			} else {
				// message.success('获取模型训练任务成功!');
			}

			if (callback) {
				callback(rs0.data);
			}
		},

		*deleteTaskOne({payload, callback}, { call, put }) {
			const rs0 = yield call(deleteTrainingTask, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除模型训练任务失败!');
				return;
			} else {
				message.success('删除模型训练任务成功!');
			}

			if (callback) {
				callback();
			}
		},

		*fetchDataList({payload, callback}, { call, put }) {
			const response = yield call(getTrainDataList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取模型训练数据列表数据失败!');
				return;
			}

			if (callback) {
				callback(response.data);
			}
		},

		*editDataOne({payload, callback}, { call, put }) {
			const rs0 = yield call(editTrainingData, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改模型训练数据失败!');
				return;
			} else {
				message.success('修改模型训练任务成功!');
			}

			const response = yield call(getTrainDataList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取模型训练数据列表数据失败!');
				return;
			}

			if (callback) {
				callback(response.data);
			}
		},

		*deleteDataOne({payload, callback}, { call, put }) {
			const rs0 = yield call(deleteTrainingData, payload.updateParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除模型训练数据失败!');
				return;
			} else {
				if(rs0.data.id == 0) {
					message.error('请先删除依赖训练数据的项目!');
					return;
				} else {
					message.success('删除模型训练数据成功!');
				}
			}

			const response = yield call(getTrainDataList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取模型训练数据列表数据失败!');
				return;
			}

			if (callback) {
				callback(response.data);
			}
		},

		*getTaskOneLog({payload, callback}, { call, put }) {
			const rs0 = yield call(getTrainTaskLog, payload.id, payload.params);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('获取模型训练日志失败!');
				return;
			} else {
				// message.success('获取模型训练日志成功!');
			}
			if (callback) {
				callback(rs0.data);
			}
		},

		*doTaskOneOp({payload, callback}, { call, put }) {
			const rs0 = yield call(postTrainingTaskOp, payload.id, payload.op);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('操作模型训练失败!');
				return;
			} else {
				message.success('操作模型训练成功!');
			}
			if (callback) {
				callback();
			}
		},

		*getTrainingTaskPerformance({payload, callback}, { call, put }) {
			const rs0 = yield call(getTrainingTaskPerformance, payload.ids);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('获取模型性能失败!');
				return;
			} else {
				// message.success('获取模型性能成功!');
			}
			if (callback) {
				callback(rs0.data);
			}
		},
	},

	reducers: {
		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.tasks,
				total: payload.tasks.length,
			};
		},
	}
};
