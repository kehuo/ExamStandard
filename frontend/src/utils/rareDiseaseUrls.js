import { stringify } from 'qs';

const { RareApi } = global;
import { buildUrlWithTs } from './utils';

// get China-Official Rare disease
export function getCnRareDiseaseListUrl(params) {
	let baseUrl = `${RareApi}/raredisease/cn-rare-diseases`;
	return buildUrlWithTs(baseUrl, params);
}
export function getCnRareDiseaseOneUrl(diseaseId) {
	let baseUrl = `${RareApi}/raredisease/cn-rare-diseases/${diseaseId}`;
	return buildUrlWithTs(baseUrl, {});
}
export function getWorldRareDiseaseListUrl(params) {
	let baseUrl = `${RareApi}/raredisease/rare-diseases`;
	return buildUrlWithTs(baseUrl, params);
}
export function getWorldRareDiseaseOneUrl(diseaseId) {
	let baseUrl = `${RareApi}/raredisease/rare-diseases/${diseaseId}`;
	return buildUrlWithTs(baseUrl, {});
}
export function getRareDiseaseCnMappingListUrl(params) {
	let baseUrl = `${RareApi}/raredisease/cn-rare-disease-mappings`;
	return buildUrlWithTs(baseUrl, params);
}
export function getRareDiseaseCnMappingOneUrl(itemId) {
	let baseUrl = `${RareApi}/raredisease/cn-rare-disease-mappings/${itemId}`;
	return buildUrlWithTs(baseUrl, {});
}
export function getRareDiseaseHpoMappingListUrl(params) {
	let baseUrl = `${RareApi}/raredisease/rare-disease-hpo-mappings`;
	return buildUrlWithTs(baseUrl, params);
}
export function getRareDiseaseHpoMappingOneUrl(itemId) {
	let baseUrl = `${RareApi}/raredisease/rare-disease-hpo-mappings/${itemId}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getRareDiseaseHpoListUrl(params) {
	let baseUrl = `${RareApi}/raredisease/hpo-items`;
	return buildUrlWithTs(baseUrl, params);
}
export function getRareDiseaseHpoOneUrl(itemId) {
	let baseUrl = `${RareApi}/raredisease/hpo-items/${itemId}`;
	return buildUrlWithTs(baseUrl, {});
}
export function getRareDiseaseHpoParentTreeUrl(itemId) {
	let baseUrl = `${RareApi}/raredisease/hpo-items/parent`;
	return buildUrlWithTs(baseUrl, {id:itemId});
}
