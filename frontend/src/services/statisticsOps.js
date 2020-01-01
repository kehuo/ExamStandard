import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getStatisticsInfo(opType,params) {
  let url = urls.getStatisticsUrl(opType,params);
  return request(url);
}

export async function getStatisticsInfo2(params) {
  let url = urls.getStatisticsUrl('generate2', {});
  return request(url, {
    method: 'POST',
    body: {
      data: params,
      method: 'post',
    },
  });
}

export async function exportStatisticsInfo2(params) {
  let url = urls.getStatisticsUrl('generate2/export', {});
  return request(url, {
    method: 'POST',
    body: {
      data: params,
      method: 'post',
    },
  });
}
