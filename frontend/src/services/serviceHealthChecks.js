import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getServiceHealthCheckResultList() {
  let url = urls.getServiceHealthCheckResultsUrl();
  return request(url);
}
