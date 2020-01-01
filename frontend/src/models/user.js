// import { query as queryUsers, queryCurrent } from '@/services/user';
import { getCurrentUser } from '@/services/userOps';
export default {
  namespace: 'user',

  state: {
    // list: [],
    currentUser: {},
  },

  effects: {
    *fetchCurrent(_, { call, put }) {
      // const response = yield call(queryCurrent);
      const response = yield call(getCurrentUser);
      if (response && response.data){
        let rsUser = response.data;
        let current = {
          status: true,
          id: rsUser.id,
          orgCode: rsUser.orgCode,
          currentAuthority: rsUser.roleName ,
          userName: rsUser.name,
          fullName: rsUser.fullName,
          email: rsUser.email,
          disabled: rsUser.disabled,
          roleId: rsUser.roleId,
          orgName: rsUser.orgName,
          roleName: rsUser.roleName
        };
        yield put({
          type: 'saveCurrentUser',
          payload: current,
        });
      }
    },
  },

  reducers: {

    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
  },
};
