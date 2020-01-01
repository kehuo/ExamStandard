import { getDepartmentList } from '@/services/departmentOps';
import { getOrganizationList } from '@/services/organizationOps';
import { getOperatorList } from '@/services/operatorOps';
import { getStatisticsInfo } from '@/services/statisticsOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

function buildStatResult(data, listXTag, listYTag, rankXTag, rankYTag) {
	let dataList = buildOptionsByTags(data.dataList, listXTag, listYTag, 'x', 'y', true);
	let dataRank = buildOptionsByTags(data.dataRank, rankXTag, rankYTag, 'title', 'total', true);
	let x = {
		dataList: dataList,
		dataRank: dataRank,
	};
	return x;
}

export default {
	namespace: 'userOperationStat',

	state: {
		recordCount: {
			dataList: [],
			dataRank: [],
		},

		operationTime: {
			dataList: [],
			dataRank: [],
		},

		operationClick: {
			dataList: [],
			dataRank: [],
		},

		numberOrganization: 0,
		numberDepartment: 0,
		numberOperator: 0,
	},

	effects: {
		*init({payload, callback}, {call, put}) {
			let queryAll = {
				page: 1,
				pageSize: 1
			};
			const response0 = yield call(getOrganizationList, queryAll);
			if (!response0.code || response0.code != 'SUCCESS') {
				message.error('获取机构列表数据失败!');
				return;
			}
			yield put({
				type: 'saveOrgCount',
				payload: response0.data.total,
			});

			const response1 = yield call(getDepartmentList, queryAll);
			if (!response1.code || response1.code != 'SUCCESS') {
				message.error('获取科室列表数据失败!');
				return;
			}
			yield put({
				type: 'saveDeptCount',
				payload: response1.data.total,
			});

			const response2 = yield call(getOperatorList, queryAll);
			if (!response2.code || response2.code != 'SUCCESS') {
				message.error('获取医生列表数据失败!');
				return;
			}
			yield put({
				type: 'saveOperatorCount',
				payload: response2.data.total,
			});

			const response = yield call(getStatisticsInfo, payload.opType, payload.params);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取统计数据失败!');
				return;
			}
			switch(payload.params.mode) {
				case 'record_count':
					yield put({
						type: 'saveRecordCountStat',
						payload: response.data,
					});
					break;
				case 'time_avg':
					yield put({
						type: 'saveOperationTimeStat',
						payload: response.data,
					});
					break;
				case 'click_avg':
					yield put({
						type: 'saveOperationClickStat',
						payload: response.data,
					});
					break;
				default:
					break;
			}
		},

		*fetchOperationData({payload, callback}, {call, put}) {
			const response = yield call(getStatisticsInfo, payload.opType, payload.params);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取统计数据失败!');
				return;
			}

			switch(payload.params.mode) {
				case 'record_count':
					yield put({
						type: 'saveRecordCountStat',
						payload: response.data,
					});
					break;
				case 'time_avg':
					yield put({
						type: 'saveOperationTimeStat',
						payload: response.data,
					});
					break;
				case 'click_avg':
					yield put({
						type: 'saveOperationClickStat',
						payload: response.data,
					});
					break;
				default:
					break;
			}
		},

	},

	reducers: {
		saveRecordCountStat(state, action) {
			let payload = action.payload;
			let x = buildStatResult(payload, 'work_date', 'record_count_sum',
				'disease_name', 'record_count_sum');
			return {
				...state,
				recordCount: x,
			};
		},

		saveOperationTimeStat(state, action) {
			let payload = action.payload;
			let x = buildStatResult(payload, 'work_date', 'operation_time_avg',
				'disease_name', 'time_avg');
			return {
				...state,
				operationTime: x,
			};
		},

		saveOperationClickStat(state, action) {
			let payload = action.payload;
			let x = buildStatResult(payload, 'work_date', 'operation_click_avg',
				'disease_name', 'click_avg');
			return {
				...state,
				operationClick: x,
			};
		},

		saveOrgCount(state, action) {
			let payload = action.payload;
			return {
				...state,
				numberOrganization: payload,
			};
		},

		saveDeptCount(state, action) {
			let payload = action.payload;
			return {
				...state,
				numberDepartment: payload,
			};
		},

		saveOperatorCount(state, action) {
			let payload = action.payload;
			return {
				...state,
				numberOperator: payload,
			};
		},
	}
};
