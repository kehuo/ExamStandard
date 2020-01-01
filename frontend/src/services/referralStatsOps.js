import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getOrgReferralStats(params) {
  let url = urls.getOrgReferralStatsUrl(params);
  return request(url);
}

export async function getTotalReferralStats(params) {
  let url = urls.getTotalReferralStatsUrl(params);
  return request(url);
}


export async function getOrgReferAcceptTopN(params) {
    let url = urls.getOrgReferAcceptTopNUrl(params);
    return request(url);
}
