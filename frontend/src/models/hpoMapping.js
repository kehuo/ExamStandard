import { getRareDiseaseHpoList } from '@/services/rareDiseaseOps';
import { getHpoMappingList, deleteHpoMappingOne, createHpoMappingOne,
	updateHpoMappingOne, getHpoMappingSuggest } from '@/services/hpoMappingOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

export default {
	namespace: 'hpoMapping',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetchMappingList({payload, callback}, {call, put}) {
			const response = yield call(getHpoMappingList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取HPO映射列表数据失败!');
				return;
			}
			if (callback) {
				callback(response.data);
			}
		},

		*createMappingOne({payload, callback}, {call, put}) {
			const rs0 = yield call(createHpoMappingOne, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('创建HPO映射失败!');
				return;
			} else {
				message.success('修改HPO映射成功!');
			}

			if (callback) {
				callback();
			}
		},

		*updateMappingOne({payload, callback}, {call, put}) {
			const rs0 = yield call(updateHpoMappingOne, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改HPO映射失败!');
				return;
			} else {
				message.success('修改HPO映射成功!');
			}

			if (callback) {
				callback();
			}
		},

		*deleteMappingOne({payload, callback}, {call, put}) {
			const rs0 = yield call(deleteHpoMappingOne, payload.deleteParams);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除HPO映射失败!');
				return;
			} else {
				message.success('删除HPO映射成功!');
			}

			const response = yield call(getHpoMappingList, payload.queryParams);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取HPO映射列表数据失败!');
				return;
			}

			if (callback) {
				callback(response.data);
			}
		},

		*suggest({payload, callback}, {call, put}) {
			const rs0 = yield call(getHpoMappingSuggest, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('获取HPO映射推荐失败!');
				return;
			}

			if (callback) {
				callback(rs0.data);
			}
		},

		*hpoChildren({payload, callback}, {call, put}) {
			const rs0 = yield call(getRareDiseaseHpoList, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('获取HPO列表失败!');
				return;
			}

			if (callback) {
				let data = [];
				for (let i=0; i<rs0.data.hpoItems.length; i++) {
					let curH = rs0.data.hpoItems[i];
					data.push({
						code: curH.code,
						name: curH.cnName ? curH.cnName : curH.enName,
						parents: curH.parents,
					});
				}
				callback(data);
			}
        },
        
        *searchHpoItems({payload, callback}, {call, put}) {
            const rs0 = yield call(getRareDiseaseHpoList, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('获取HPO列表失败!');
				return;
			}
			if (callback) {
				let data = [];
				for (let i=0; i<rs0.data.hpoItems.length; i++) {
					let curH = rs0.data.hpoItems[i];
					data.push({
						code: curH.code,
						name: curH.cnName ? curH.cnName : curH.enName,
					});
				}
				callback(data);
			}
        }
	},

	reducers: {
		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.hpos,
				total: payload.total,
			};
		},
	}
};
