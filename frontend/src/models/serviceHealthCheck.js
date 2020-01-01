import { getServiceHealthCheckResultList } from '@/services/serviceHealthChecks';
import { message } from 'antd';


export default {
  namespace: 'serviceHealthCheckResult',

  state: {
    data: [],
    total: 0,
  },

  effects: {
    *fetch({callback}, {call, put}) {
      const response = yield call(getServiceHealthCheckResultList);
      if (!response.code || response.code != 'SUCCESS') {
        message.error('获取系统服务运行状态列表数据失败!');
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
        data: payload.messages,
        total: payload.total,
      };
    },
  }
};
