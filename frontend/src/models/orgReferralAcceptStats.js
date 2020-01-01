import {  getOrgReferAcceptTopN } from "@/services/referralStatsOps";
import { message } from "antd";


export default {
    namespace: "referralAcceptStatistics",

    state: {
        orgReferralAcceptTopNList: []
    },

    effects: {
        * fetch({ payload, callback }, { call, put }) {
            // const response0 = yield call(getOrgReferralStats, {page:1, pageSize:100});
            const response0 = yield call(getOrgReferAcceptTopN, payload);
            if (!response0.code || response0.code != "SUCCESS") {
                message.error("获取机构转诊接收情况统计信息数据失败!");
                return;
            }

            let data = response0.data;
            yield put({
                type: "saveList",
                payload: data
            });


        }
    },

    reducers: {
        saveList(state, action) {
            let payload = action.payload;
            return {
                ...state,
                orgReferralAcceptTopNList: payload

            };
        }

    }
};
