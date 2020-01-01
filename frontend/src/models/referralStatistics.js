import { getOrgReferralStats, getTotalReferralStats } from '@/services/referralStatsOps';
import { message } from 'antd';
import { buildTotalReferralStatsData } from '../utils/utils';

export default {
  namespace: 'referralStatistics',

  state: {
    orgReferralList: [],
    total: 0,
    totalReferralStats: [],
  },

  effects: {
    *fetch({payload, callback}, {call, put}) {
      // const response0 = yield call(getOrgReferralStats, {page:1, pageSize:100});
      const response0 = yield call(getOrgReferralStats,payload);
      if (!response0.code || response0.code != 'SUCCESS') {
        message.error('获取机构转诊信息列表数据失败!');
        return;
      }

      let data = response0.data;
      yield put({
        type: 'saveList',
        payload: data,
      });

      const response = yield call(getTotalReferralStats, payload);
      if (!response.code || response.code != 'SUCCESS') {
        message.error('获取所有接入机构汇总转诊数据失败!');
        return;
      }
      // console.log(playload);
      let totleReferralStats = callback(payload.startDate,response.data);
      yield put({
        type: 'saveOptions',
        payload: totleReferralStats,
      });
    },
  },

  reducers: {
    saveList(state, action) {
      let payload = action.payload;
      return {
        ...state,
        orgReferralList: payload.orgReferralList,
        total: payload.total,
      };
    },

    saveOptions(state, action) {
      let payload = action.payload;
      return {
        ...state,
        totalReferralStats: payload,
      };
    },
  }
};
