import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getDistrictOrgList(params) {
    let url = urls.getDistrictOrgListUrl(params);
    return request(url);
}

export async function getDoctorEventsStats(params) {
    let url = urls.getDoctorEventsStatsUrl(params);
    return request(url);
}

export async function getOrgEmrQualityStats(params) {
    let url = urls.getOrgEmrQualityStatsUrl(params);
    return request(url);
}

export async function getOrgEmrVisitStats(params) {
    let url = urls.getOrgEmrVisitStatsUrl(params);
    return request(url);
}

export async function getOrgMedicineExamReferralStats(params) {
    let url = urls.getOrgMedicineExamReferralStatsUrl(params);
    return request(url);
}

export async function getDistrictOrgStats(params) {
    let url = urls.getDistrictOrgStatsUrl(params);
    return request(url);
}
