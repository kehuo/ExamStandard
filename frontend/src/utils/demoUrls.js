import { stringify } from 'qs';

const { DemoApi } = global;
const demoBase = 'service/emr';
import { buildUrlWithTs } from './utils';

export function getTypeListUrl() {
	let baseUrl = `${DemoApi}/${demoBase}/type-list`;
	return buildUrlWithTs(baseUrl, {});
}

export function getRecordsListUrl() {
	let baseUrl = `${DemoApi}/${demoBase}/records-list`;
	return buildUrlWithTs(baseUrl, {});
}

export function getStructureUrl() {
	let baseUrl = `${DemoApi}/${demoBase}/structure`;
	return buildUrlWithTs(baseUrl, {});
}
