import { getDepartmentList, editDepartment, deleteDepartment } from '@/services/departmentOps';
import { getMasterDataListSearch, getMasterDataOneExtension } from '@/services/masterDataOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

const mockData = [
	{id:1, name:'feature design 1', description: '2017-09-01 包含时间'},
	{id:2, name:'feature design 2', description: '2017-07 呼吸科'},
	{id:3, name:'feature design 3', description: '2018-07 呼吸科'},
];

export default {
	namespace: 'trainDataConfigList',

	state: {
		data: mockData, //[],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			// const response = yield call(getDepartmentList, payload);
			// if (!response.code || response.code != 'SUCCESS') {
			// 	message.error('获取科室列表数据失败!');
			// 	return;
			// }

			// if (callback) {
			// 	callback(response.data);
			// }
			callback(mockData);
		},

		*delete({payload, callback}, {call, put}) {
			// const rs0 = yield call(editDepartment, payload.updateParams);
			// if (!rs0.code || rs0.code != 'SUCCESS') {
			// 	message.error('修改科室失败!');
			// 	return;
			// } else {
			// 	message.success('修改科室成功!');
			// }
			message.success('添加或修改特征设计成功!');
			if (callback) {
				callback();
			}
		},
	},

	reducers: {
		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.departments,
				total: payload.total,
			};
		},
	}
};
