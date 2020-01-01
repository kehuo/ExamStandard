import {
    getDistrictOrgStats
} from "@/services/primaryHealthStats";
import { message } from "antd";
import { buildOptionsByTags } from "../utils/utils";


export default {
    namespace: "primaryHealthOverview",

    state: {
        district_stats: {}
    },

    effects: {
        * fetch({ payload, callback }, { call, put }) {

            const response0 = yield call(getDistrictOrgStats, payload.params);
            if (!response0.code || response0.code != "SUCCESS") {
                message.error("获取机构列表数据失败!");
                return;
            }
            yield put({
                type: "saveDistrictOrgStats",
                payload: response0.data.district_stats
            });
        }
    },

    reducers: {
        saveDistrictOrgStats(state, action) {
            let district_stats = action.payload;

            return {
                ...state,district_stats
            };
        }
    }
};
