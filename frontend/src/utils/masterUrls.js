import { stringify } from 'qs';

const { OpApi } = global;
const masterBase = 'master_data';
import { buildUrlWithTs } from './utils';

// master data APIs
export function getMasterDataListUrl(params) {
	// return `${OpApi}/${masterBase}/master-data?${stringify(params)}`;
	let baseUrl = `${OpApi}/${masterBase}/master-data`;
	return buildUrlWithTs(baseUrl, params);
}

export function getMasterDataOneUrl(id, typeM) {
	// return `${OpApi}/${masterBase}/master-data/${id}?type=${typeM}`;
	let baseUrl = `${OpApi}/${masterBase}/master-data/${id}`;
	let params = {
		type: typeM,
	};
	return buildUrlWithTs(baseUrl, params);
}

export function getMasterListSearchUrl(params) {
	// return `${OpApi}/${masterBase}/master-data/search?${stringify(params)}`;
	let baseUrl = `${OpApi}/${masterBase}/master-data/search`;
	return buildUrlWithTs(baseUrl, params);
}

export function getMasterParentTreeUrl(params) {
	// return `${OpApi}/${masterBase}/master-data/parent-tree?${stringify(params)}`;
	let baseUrl = `${OpApi}/${masterBase}/master-data/parent-tree`;
	return buildUrlWithTs(baseUrl, params);
}

export function getMasterDataFuncTestUrl() {
	// return `${OpApi}/${masterBase}/master-data/function-test`;
	let baseUrl = `${OpApi}/${masterBase}/master-data/function-test`;
	return buildUrlWithTs(baseUrl, {});
}

export function getMasterDataFuncGenUrl(id) {
	// return `${OpApi}/${masterBase}/master-data/function-gen?data_id=${id}`;
	let baseUrl = `${OpApi}/${masterBase}/master-data/function-gen`;
	let params = {
		data_id: id,
	};
	return buildUrlWithTs(baseUrl, params);
}

export function getMasterDataOneComplicateUrl(id, typeM) {
	// return `${OpApi}/${masterBase}/master-data/${id}/complicate?type=${typeM}`;
	let baseUrl = `${OpApi}/${masterBase}/master-data/${id}/complicate`;
	let params = {
		type: typeM,
	};
	return buildUrlWithTs(baseUrl, params);
}

export function getMasterDataOneExtensionUrl(id, typeM) {
	// return `${OpApi}/${masterBase}/master-data/${id}/extension?type=${typeM}`;
	let baseUrl = `${OpApi}/${masterBase}/master-data/${id}/extension`;
	let params = {
		type: typeM,
	};
	return buildUrlWithTs(baseUrl, params);
}

export function getVectorMappingListUrl(params) {
	// return `${OpApi}/${masterBase}/dictionary/vectormapping?${stringify(params)}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/vectormapping`;
	return buildUrlWithTs(baseUrl, params);
}

export function getPropMappingListUrl(params) {
	// return `${OpApi}/${masterBase}/dictionary/propmapping?${stringify(params)}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/propmapping`;
	return buildUrlWithTs(baseUrl, params);
}

export function getSplitListUrl(params) {
	// return `${OpApi}/${masterBase}/dictionary/splitvectors?${stringify(params)}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/splitvectors`;
	return buildUrlWithTs(baseUrl, params);
}

export function getDiscardListUrl(params) {
	// return `${OpApi}/${masterBase}/dictionary/discardvectors?${stringify(params)}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/discardvectors`;
	return buildUrlWithTs(baseUrl, params);
}

export function deleteDiscardOneUrl(id) {
	// return `${OpApi}/${masterBase}/dictionary/discardvectors/${id}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/discardvectors/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function newDiscardOneUrl() {
	// return `${OpApi}/${masterBase}/dictionary/discardvectors`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/discardvectors`;
	return buildUrlWithTs(baseUrl, {});
}

export function newSplitOneUrl() {
	// return `${OpApi}/${masterBase}/dictionary/splitvectors`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/splitvectors`;
	return buildUrlWithTs(baseUrl, {});
}

export function editSplitOneUrl(id) {
	// return `${OpApi}/${masterBase}/dictionary/splitvectors/${id}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/splitvectors/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function deleteSplitOneUrl(id) {
	// return `${OpApi}/${masterBase}/dictionary/splitvectors/${id}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/splitvectors/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function newPropMappingOneUrl() {
	// return `${OpApi}/${masterBase}/dictionary/propmapping`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/propmapping`;
	return buildUrlWithTs(baseUrl, {});
}

export function editPropMappingOneUrl(id) {
	// return `${OpApi}/${masterBase}/dictionary/propmapping/${id}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/propmapping/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function deletePropMappingOneUrl(id) {
	// return `${OpApi}/${masterBase}/dictionary/propmapping/${id}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/propmapping/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function newVectorMappingOneUrl() {
	// return `${OpApi}/${masterBase}/dictionary/vectormapping`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/vectormapping`;
	return buildUrlWithTs(baseUrl, {});
}

export function editVectorMappingOneUrl(id) {
	// return `${OpApi}/${masterBase}/dictionary/vectormapping/${id}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/vectormapping/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function deleteVectorMappingOneUrl(id) {
	// return `${OpApi}/${masterBase}/dictionary/vectormapping/${id}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/vectormapping/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getTaggingTaskListUrl(params) {
	// return `${OpApi}/${masterBase}/tagging?${stringify(params)}`;
	let baseUrl = `${OpApi}/${masterBase}/tagging`;
	return buildUrlWithTs(baseUrl, params);
}

export function getTaggingTaskOneUrl(id) {
	// return `${OpApi}/${masterBase}/tagging/${id}`;
	let baseUrl = `${OpApi}/${masterBase}/tagging/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getNormTaskUrl(params) {
	// return `${OpApi}/${masterBase}/dictionary/normtasks?${stringify(params)}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/normtasks`;
	return buildUrlWithTs(baseUrl, params);
}

export function doNormTaskOneUrl(id) {
	// return `${OpApi}/${masterBase}/dictionary/normtasks/${id}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/normtasks/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function emrReferOneUrl(id) {
	// return `${OpApi}/${masterBase}/dictionary/emrrefer/${id}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/emrrefer/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getVectorRefUrl(params) {
	// return `${OpApi}/${masterBase}/dictionary/proposalvectors?${stringify(params)}`;
	let baseUrl = `${OpApi}/${masterBase}/dictionary/proposalvectors`;
	return buildUrlWithTs(baseUrl, params);
}

export function createSmartExpandUrl() {
	let baseUrl = `${OpApi}/${masterBase}/master-data/smart-expand`;
	return buildUrlWithTs(baseUrl, {});
}

// hpo mapping apis
export function getHpoMappingListUrl(params) {
	let baseUrl = `${OpApi}/${masterBase}/hpo-mapping`;
	return buildUrlWithTs(baseUrl, params);
}

export function getHpoMappingOneUrl(mappingId) {
	let baseUrl = `${OpApi}/${masterBase}/hpo-mapping/${mappingId}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getHpoMappingSuggestUrl() {
	let baseUrl = `${OpApi}/${masterBase}/hpo-mapping/predict`;
	return buildUrlWithTs(baseUrl, {});
}

export function getTotalTestUrl() {
	let baseUrl = `${OpApi}/${masterBase}/total-test`;
	return buildUrlWithTs(baseUrl, {});
}
