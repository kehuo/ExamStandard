import {
    getDistrictOrgList,
    getDoctorEventsStats,
    getOrgEmrQualityStats,
    getOrgEmrVisitStats,
    getOrgMedicineExamReferralStats
} from "@/services/primaryHealthStats";
import { message } from "antd";
let moment = require("moment");


function buildQualityRatio(data) {
    if (!data) {
        return;
    }
    var chartData = [];
    const total = data.excellent_emr_count + data.unqualified_emr_count + data.qualified_emr_count;
    chartData.push({ "item": "优秀", "count": data.excellent_emr_count, "percent": "优秀" + (data.excellent_emr_count / total*100).toFixed(2) });
    chartData.push({ "item": "合格", "count": data.qualified_emr_count, "percent": "合格" + (data.qualified_emr_count / total*100).toFixed(2) });
    chartData.push({ "item": "不合格", "count": data.unqualified_emr_count, "percent": "不合格" + (data.unqualified_emr_count / total*100).toFixed(2) });
    return chartData;
}

function buildTimelineChartDataY(startDate,data) {
    let a = moment(new Date()).subtract(1,'months').format('YYYY-MM-DD');

    let chartsData = [];
    let startMonth = moment(startDate);
    let months = [];
    let currentMonth = moment(moment().add(0,'month').format('YYYY-MM') + '-01');

    if (startMonth.isSame(currentMonth)) {
        let three = startMonth.add(0,'month').format('YYYY-MM');
        let one = startMonth.subtract(+1,'month').format('YYYY-MM');
        let two = startMonth.subtract(+1,'month').format('YYYY-MM');

        months = [one, two, three];
    }else{
        let two = startMonth.add(0,'month').format("YYYY-MM");
        let one = startMonth.subtract(1, "month").format("YYYY-MM");

        let three = startMonth.add(2, "month").format("YYYY-MM");
        months = [one, two, three];
    }
    let dataMonth = [];
    for (var i=0;i<data.length;i++) {
        chartsData.push({ x: data[i].month, y: "有效药品推荐%", v: data[i].succeed_rec_medicine_ratio });
        chartsData.push({ x: data[i].month, y: "有效检查推荐%", v: data[i].succeed_rec_exam_ratio });
        chartsData.push({ x: data[i].month, y: "有效转诊%", v: data[i].valid_referral_ratio });
        dataMonth.push(data[i].month);
    }
    for(var i in months){
        if (dataMonth.indexOf(months[i])==-1){
            chartsData.push({ x: months[i], y: "有效药品推荐%", v: 0 });
            chartsData.push({ x: months[i], y: "有效检查推荐%", v: 0 });
            chartsData.push({ x: months[i], y: "有效转诊%", v: 0 });
        }
    }
    return chartsData;
}

// function getDistrictOrgs(obj, mykeyValues) {
//     districtOrgs = [];
//     //没有则跳出
//     if (!obj["district_code"]) {
//         return districtOrgs;
//     } else {
//         //有就放入
//         districtOrgs.push(obj["district_code"]);
//         //再次递归
//         var keys = Object.keys(obj);
//         keys.forEach(function(i) {
//             getDistrictOrgs(obj[i], mykeyValues);
//         });
//     }
//     return mykeyValues;
// }

export default {
    namespace: "primaryHealthOrgDetail",

    state: {
        districtOrgs: [],

        doctorEventsStats: {
            total: 0,
            doctorEvents: []
        },

        orgEmrQualityStats: [],
        orgEmrVisitStats: [],
        orgMedicineExamReferralStats: []
    },

    effects: {
        * init({ payload, callback }, { call, put }) {
            // let queryAll = {
            //     page: 1,
            //     pageSize: 1
            // };
            const response0 = yield call(getDistrictOrgList);
            if (!response0.code || response0.code != "SUCCESS") {
                message.error("获取机构列表数据失败!");
                return;
            }
            yield put({
                type: "saveDistrictOrgs",
                payload: response0.data
            });


        },

        * fetchPrimaryHealthOrgData({ payload, callback }, { call, put }) {
            let queryAll = {
                page: 1,
                pageSize: 1
            };


            const response1 = yield call(getDoctorEventsStats, payload.params);
            if (!response1.code || response1.code != "SUCCESS") {
                message.error("获取医生维度统计列表数据失败!");
                return;
            }
            yield put({
                type: "saveDoctorEventsStats",
                payload: response1.data
            });

            const response2 = yield call(getOrgEmrQualityStats, payload.params);
            if (!response2.code || response2.code != "SUCCESS") {
                message.error("获取机构病历质量数据失败!");
                return;
            }
            let orgEmrQualityStats = buildQualityRatio(response2.data);
            yield put({
                type: "saveOrgEmrQualityStats",
                payload: orgEmrQualityStats
            });
            const response3 = yield call(getOrgEmrVisitStats, payload.params);
            if (!response3.code || response3.code != "SUCCESS") {
                message.error("获取机构就诊病历数据失败!");
                return;
            }
            let orgEmrVisitStats = callback(response3.data);
            yield put({
                type: "saveOrgEmrVisitStats",
                payload: orgEmrVisitStats
            });
            const response4 = yield call(getOrgMedicineExamReferralStats, payload.params);
            if (!response4.code || response4.code != "SUCCESS") {
                message.error("获取机构检查处方转诊数据失败!");
                return;
            }
            let orgMedicineExamReferralStats = buildTimelineChartDataY(payload.startDate,response4.data);
            yield put({
                type: "saveOrgMedicineExamReferralStats",
                payload: orgMedicineExamReferralStats
            });

        }

    },

    reducers: {
        saveDistrictOrgs(state, action) {
            let payload = action.payload;

            return {
                ...state,
                districtOrgs: payload
            };
        },

        saveDoctorEventsStats(state, action) {
            let payload = action.payload;

            return {
                ...state,
                doctorEventsStats: payload
            };
        },

        saveOrgEmrQualityStats(state, action) {
            let payload = action.payload;

            return {
                ...state,
                orgEmrQualityStats: payload
            };
        },

        saveOrgEmrVisitStats(state, action) {
            let payload = action.payload;
            return {
                ...state,
                orgEmrVisitStats: payload
            };
        },

        saveOrgMedicineExamReferralStats(state, action) {
            let payload = action.payload;
            return {
                ...state,
                orgMedicineExamReferralStats: payload
            };
        },
        saveDistrictOrgStats(state, action) {
            let payload = action.payload;
            return {
                ...state,
                orgMedicineExamReferralStats: payload
            };
        }

    }
};
