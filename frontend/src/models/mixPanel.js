import { getDepartmentList } from '@/services/departmentOps';
import { getOrganizationList } from '@/services/organizationOps';
import { getOperatorList } from '@/services/operatorOps';
import { getDiseaseList } from '@/services/diseaseOps';
import { getStatisticsInfo2, exportStatisticsInfo2 } from '@/services/statisticsOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';
import { saveAs } from 'file-saver';

export default {
	namespace: 'mixPanel',

	state: {
		data: [],
		total: 0,

		departmentOpts: [],
		operatorOpts: [],
		diseaseOpts: [],
	},

	effects: {
		*fetchDepartment({payload, callback}, {call, put}) {
			let queryAll = {
				page: 1,
				pageSize: 500
			};

			const response1 = yield call(getDepartmentList, queryAll);
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取科室列表数据失败!');
				return;
			}
			yield put({
				type: 'saveDept',
				payload: response1.data,
			});
		},

		*fetchOperator({payload, callback}, {call, put}) {
			let queryAll = {
				page: 1,
				pageSize: 1000
			};

			const response2 = yield call(getOperatorList, queryAll);
			if (!response2.code || response2.code != 'SUCCESS') {
				message.error('获取医生列表数据失败!');
				return;
			}
			yield put({
				type: 'saveOperator',
				payload: response2.data,
			});
		},

		*fetchDisease({payload, callback}, {call, put}) {
			const response2 = yield call(getDiseaseList, payload);
			if (!response2.code || response2.code != 'SUCCESS') {
				message.error('获取疾病列表数据失败!');
				return;
			}
			yield put({
				type: 'saveDisease',
				payload: response2.data,
			});
		},

		*fetchAll({payload, callback}, {call, put}) {
			let payloadX = JSON.parse(JSON.stringify(payload));

			payloadX.mode = 'data';
			const responseX = yield call(getStatisticsInfo2, payloadX);
			if (!responseX.code || responseX.code != 'SUCCESS') {
				message.error('获取统计数据失败!');
				return;
			}
			yield put({
				type: 'saveList',
				payload: responseX.data,
			});

			let data = {};

			payloadX.mode = 'disease_distribution';
			const response0 = yield call(getStatisticsInfo2, payloadX);
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取疾病分布统计数据失败!');
				return;
			}
			data['disease_distribution'] = response0.data;

			payloadX.mode = 'doctor_distribution';
			const response1 = yield call(getStatisticsInfo2, payloadX);
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取医生分布统计数据失败!');
				return;
			}
			data['doctor_distribution'] = response1.data;

			payloadX.mode = 'usage_distribution';
			const response2 = yield call(getStatisticsInfo2, payloadX);
			if (!response2.code || response2.code != 'SUCCESS') {
				message.error('获取使用统计数据失败!');
				return;
			}
			data['usage_distribution'] = response2.data;

			if (callback) {
				callback(data);
			}
		},

		*fetchList({payload, callback}, {call, put}) {
			let payloadX = JSON.parse(JSON.stringify(payload));
			payloadX.mode = 'data';
			const responseX = yield call(getStatisticsInfo2, payloadX);
			if (!responseX.code || responseX.code != 'SUCCESS') {
				message.error('获取统计数据失败!');
				return;
			}

			yield put({
				type: 'saveList',
				payload: responseX.data,
			});
		},

		*exportList({payload, callback}, {call, put}) {
			let responseX = yield call(exportStatisticsInfo2, payload);
			if (responseX instanceof Blob) {
				let fileName = 'queryList.xlsx';
				saveAs(responseX, fileName);
				return;
			}

			if (!responseX.code || responseX.code != 'SUCCESS') {
				message.error('导出统计数据失败!');
				return;
			}
		},
	},

	reducers: {
		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.items,
				total: payload.total,
			};
		},

		saveDept(state, action) {
			let payload = action.payload;
			return {
				...state,
				departmentOpts: buildOptsByPairs(payload.departments,
					['org_code','code'], ['orgCode','deptCode'], ['name', 'code']),
			};
		},

		saveOperator(state, action) {
			let payload = action.payload;
			return {
				...state,
				operatorOpts: buildOptsByPairs(payload.operators,
					['org_code','operator_id'], ['orgCode','operatorId'], ['name', 'operator_id']),
			};
		},

		saveDisease(state, action) {
			let payload = action.payload;
			return {
				...state,
				diseaseOpts: buildOptionsByTags(payload.diseases, ['code','name'], 'id'),
			};
		},
	}
};

function buildOptsByPairs(data, origTags, newTags, nameTags) {
	let rst = [];
	for (let i=0; i<data.length; i++) {
		let curD = data[i];

		let x = {};
		for (let j=0; j<origTags.length; j++) {
			let oldT = origTags[j];
			let newT = newTags[j];
			x[newT] = curD[oldT];
		}

		let name = '暂无';
		for (let j=0; j<nameTags.length; j++) {
			let nameT = nameTags[j];
			let m = curD[nameT];
			if (!m) {
				continue;
			}
			name = m;
			break;
		}
		rst.push({
			k: name, v: JSON.stringify(x)
		});
	}
	return rst;
}
