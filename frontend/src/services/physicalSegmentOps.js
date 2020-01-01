import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getBodyPartList(params) {
	let url = urls.getBodyPartListUrl(params);
	return request(url);
}

export async function editPhysicalSegment(record) {
	if (record.id == 0 || record.id == '0'){
		let url = urls.getPhysicalSegmentUrl({});
    return request(url, {
      method: 'POST',
      body: {
        data: record,
        method: 'post',
      },
    });
	}else {
    let url = urls.getPhysicalSegmentOneUrl(record.id);
    return request(url, {
      method: 'PUT',
      body: {
        data: record,
        method: 'put',
      },
    });
  }
}

export async function deletePhysicalSegment(record) {
	let url = urls.getPhysicalSegmentOneUrl(record.id);
	return request(url, {
		method: 'DELETE',
		body: {
			method: 'delete',
		},
	});
}
