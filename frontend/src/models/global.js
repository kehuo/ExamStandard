// import { queryNotices } from '@/services/api';
import { getNotificationList } from '@/services/notificationOps';

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    noticeCount: 0,
  },

  effects: {
    *fetchNotices({ payload }, { call, put }) {
      const response = yield call(getNotificationList, payload);
      yield put({
        type: 'saveNoticeCount',
        payload: response.data,
      });
    },

    // *fetchNotices(_, { call, put }) {
    //   const data = yield call(queryNotices);
    //   yield put({
    //     type: 'saveNotices',
    //     payload: data,
    //   });
    //   yield put({
    //     type: 'user/changeNotifyCount',
    //     payload: data.length,
    //   });
    // },
    //
    // *clearNotices({ payload }, { put, select }) {
    //   yield put({
    //     type: 'saveClearedNotices',
    //     payload,
    //   });
    //   const count = yield select(state => state.global.notices.length);
    //   yield put({
    //     type: 'user/changeNotifyCount',
    //     payload: count,
    //   });
    // },
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    // saveNotices(state, { payload }) {
    //   return {
    //     ...state,
    //     notices: payload,
    //   };
    // },
    // saveClearedNotices(state, { payload }) {
    //   return {
    //     ...state,
    //     notices: state.notices.filter(item => item.type !== payload),
    //   };
    // },
    saveNoticeCount(state, { payload }) {
      return {
        ...state,
        noticeCount: payload.total,
      };
    }
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
