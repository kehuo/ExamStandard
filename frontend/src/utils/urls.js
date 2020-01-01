import { stringify } from 'qs';

const { OpApi, DemoApi } = global;
// operationBase 对应的值, 就是后台flask auth 模块
const operationBase = 'exam_standard';
import { buildUrlWithTs } from './utils';

// disease package URLs
export function getPackageListUrl(params) {
	// return `${OpApi}/${operationBase}/disease-package?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/disease-package`;
	return buildUrlWithTs(baseUrl, params);
}

export function getPackageOneUrl(id) {
	// return `${OpApi}/${operationBase}/disease-package/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/disease-package/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getPackageByDiseaseUrl(params) {
	// return `${OpApi}/${operationBase}/disease-package/disease?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/disease-package/disease`;
	return buildUrlWithTs(baseUrl, params);
}

export function getDiseaseListUrl(params) {
	// return `${OpApi}/${operationBase}/disease?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/disease`;
	return buildUrlWithTs(baseUrl, params);
}

export function getDiseaseOneUrl(id) {
	// return `${OpApi}/${operationBase}/disease/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/disease/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getEntitySegmentUrl(params) {
	// return `${OpApi}/${operationBase}/entity-segment?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/entity-segment`;
	return buildUrlWithTs(baseUrl, params);
}

export function getTemplatePreview() {
	// return `${OpApi}/${operationBase}/template/preview`;
	let baseUrl = `${OpApi}/${operationBase}/template/preview`;
	return buildUrlWithTs(baseUrl, {});
}

export function getTemplateTest() {
	// return `${OpApi}/${operationBase}/template/test`;
	let baseUrl = `${OpApi}/${operationBase}/template/test`;
	return buildUrlWithTs(baseUrl, {});
}

export function getTemplateUpdateStatusListUrl(params) {
	// return `${OpApi}/${operationBase}/template/update-status`;
	let baseUrl = `${OpApi}/${operationBase}/template/update-status`;
	return buildUrlWithTs(baseUrl, params);
}

export function getDoctorTemplateListUrl(params) {
	// return `${OpApi}/${operationBase}/template/update-status`;
	let baseUrl = `${OpApi}/${operationBase}/template/doctor-template`;
	return buildUrlWithTs(baseUrl, params);
}

export function getDoctorTemplateOneUrl(templateId) {
	// return `${OpApi}/${operationBase}/template/update-status`;
	let baseUrl = `${OpApi}/${operationBase}/template/doctor-template/${templateId}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getPhysicalSegmentUrl(params) {
	// return `${OpApi}/${operationBase}/physical-segment?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/physical-segment`;
	return buildUrlWithTs(baseUrl, params);
}

export function getPhysicalSegmentOneUrl(id) {
	// return `${OpApi}/${operationBase}/physical-segment/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/physical-segment/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getEntitySegmentOneUrl(id) {
	// return `${OpApi}/${operationBase}/entity-segment/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/entity-segment/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

// disease exam mapping URLs
export function getDiseaseExamMappingListUrl(params) {
	// return `${OpApi}/${operationBase}/disease-exam?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/disease-exam`;
	return buildUrlWithTs(baseUrl, params);
}

export function editDiseaseExamMappingUrl(id) {
	// return `${OpApi}/${operationBase}/disease-exam/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/disease-exam/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getExamListUrl(params) {
	// return `${OpApi}/${operationBase}/exam?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/exam`;
	return buildUrlWithTs(baseUrl, params);
}

export function getExamOneUrl(id) {
	// return `${OpApi}/${operationBase}/exam/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/exam/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

// organization && operator apis
export function getOrganizationListUrl(params) {
	// return `${OpApi}/${operationBase}/organization`;
	let baseUrl = `${OpApi}/${operationBase}/organization`;
	return buildUrlWithTs(baseUrl, params);
}

export function getOrganizationOneUrl(id) {
	// return `${OpApi}/${operationBase}/organization/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/organization/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getImpOrganizationUrl(params) {
    // return `${OpApi}/${operationBase}/imp-organizations?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/imp-organizations`;
	return buildUrlWithTs(baseUrl, params);
}

export function getGenOrgCodeUrl() {
    // return `${OpApi}/${operationBase}/orgCode`;
	let baseUrl = `${OpApi}/${operationBase}/orgCode`;
	return buildUrlWithTs(baseUrl, {});
}

export function getOperatorListUrl(params) {
	// return `${OpApi}/${operationBase}/operator?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/operator`;
	return buildUrlWithTs(baseUrl, params);
}

// bodyPart api
export function getBodyPartListUrl(params) {
	// return `${OpApi}/${operationBase}/body-part?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/body-part`;
	return buildUrlWithTs(baseUrl, params);
}

export function getBodyPartOneUrl(id) {
	// return `${OpApi}/${operationBase}/body-part/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/body-part/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getDiseaseSystemUrl(params) {
	// return `${OpApi}/${operationBase}/disease-system?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/disease-system`;
	return buildUrlWithTs(baseUrl, params);
}

export function getDiseaseSystemOneUrl(id) {
	// return `${OpApi}/${operationBase}/disease-system/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/disease-system/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getDataSourceListUrl(params) {
	// return `${OpApi}/${operationBase}/data-source?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/data-source`;
	return buildUrlWithTs(baseUrl, params);
}

export function getDataSourceOneUrl(id) {
	// return `${OpApi}/${operationBase}/data-source/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/data-source/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

// Role api
export function getRoleUrl(params) {
	// return `${OpApi}/${operationBase}/role?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/role`;
	return buildUrlWithTs(baseUrl, params);
}

export function getRoleOneUrl(id) {
	// return `${OpApi}/${operationBase}/role/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/role/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getUserUrl(params) {
	// return `${OpApi}/${operationBase}/user?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/user`;
	return buildUrlWithTs(baseUrl, params);
}

export function getUserOneUrl(id) {
	// return `${OpApi}/${operationBase}/user/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/user/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getCurrentUserUrl() {
    // return `${OpApi}/${operationBase}/currentUser`;
	let baseUrl = `${OpApi}/${operationBase}/currentUser`;
	return buildUrlWithTs(baseUrl, {});
}

export function getDepartmentUrl(params) {
	// return `${OpApi}/${operationBase}/real-department?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/real-department`;
	return buildUrlWithTs(baseUrl, params);
}

export function getDepartmentOneUrl(id) {
	// return `${OpApi}/${operationBase}/real-department/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/real-department/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getImpDepartmentsUrl() {
    // return `${OpApi}/${operationBase}/imp-realDepartments`;
	let baseUrl = `${OpApi}/${operationBase}/imp-realDepartments`;
	return buildUrlWithTs(baseUrl, {});
}

export function signInUrl() {
	// return `${OpApi}/${operationBase}/login`;
	let baseUrl = `${OpApi}/${operationBase}/login`;
	return buildUrlWithTs(baseUrl, {});
}

export function signOutUrl() {
	let baseUrl = `${OpApi}/${operationBase}/logout`;
	return buildUrlWithTs(baseUrl, {});
}


export function getVirtualDepartmentListUrl(params) {
	// return `${OpApi}/${operationBase}/virtual-department?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/virtual-department`;
	return buildUrlWithTs(baseUrl, params);
}

export function getVirtualDepartmentOneUrl(id) {
	// return `${OpApi}/${operationBase}/virtual-department/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/virtual-department/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

// 3-party api
export function getHpoList(params) {
	// return `${OpApi}/${operationBase}/hpo?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/hpo`;
	return buildUrlWithTs(baseUrl, params);
}

export function getHpoOneUrl(id) {
	// return `${OpApi}/${operationBase}/hpo/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/hpo/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getHpoParentTreeUrl(id) {
	// return `${OpApi}/${operationBase}/hpo/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/hpo/parent`;
	return buildUrlWithTs(baseUrl, {id:id});
}

export function getImpHPOItemUrl(){
    // return `${OpApi}/${operationBase}/imp-hpo`;
	let baseUrl = `${OpApi}/${operationBase}/imp-hpo`;
	return buildUrlWithTs(baseUrl, {});
}

export function getHeredopathiaHpoListUrl(params) {
	// return `${OpApi}/${operationBase}/OmimMorbidMap?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/OmimMorbidMap`;
	return buildUrlWithTs(baseUrl, params);
}

export function getHeredopathiaHpoOneUrl(id) {
	// return `${OpApi}/${operationBase}/OmimMorbidMap/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/OmimMorbidMap/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

export function impHeredopathiaHposUrl() {
    // return `${OpApi}/${operationBase}/imp-omimMorbidMap`;
	let baseUrl = `${OpApi}/${operationBase}/imp-omimMorbidMap`;
	return buildUrlWithTs(baseUrl, {});
}

export function getThirdPartyServiceListUrl(params) {
	// return `${OpApi}/${operationBase}/third-party-service?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/third-party-service`;
	return buildUrlWithTs(baseUrl, params);
}

export function getThirdPartyServiceOneUrl(id) {
	// return `${OpApi}/${operationBase}/third-party-service/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/third-party-service/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

// statistics api
export function getStatisticsUrl(opType, params) {
	// return `${OpApi}/${operationBase}/statistics/${opType}?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/statistics/${opType}`;
	return buildUrlWithTs(baseUrl, params);
}

// grass-roots hospitals statistics api
export function getDistrictOrgListUrl(params) {
    // return `${OpApi}/${operationBase}/statistics/${opType}?${stringify(params)}`;
    let baseUrl = `${OpApi}/${operationBase}/district-orgs`;
    return buildUrlWithTs(baseUrl, params);
}

export function getDistrictOrgStatsUrl(params) {
    // return `${OpApi}/${operationBase}/statistics/${opType}?${stringify(params)}`;
    let baseUrl = `${OpApi}/${operationBase}/statistics/district-org-stats`;
    return buildUrlWithTs(baseUrl, params);
}

export function getOrgMedicineExamReferralStatsUrl( params) {
    // return `${OpApi}/${operationBase}/statistics/${opType}?${stringify(params)}`;
    let baseUrl = `${OpApi}/${operationBase}/statistics/org-medicine-exam-referral-stats`;
    return buildUrlWithTs(baseUrl, params);
}
export function getOrgEmrVisitStatsUrl(params) {
    // return `${OpApi}/${operationBase}/statistics/${opType}?${stringify(params)}`;
    let baseUrl = `${OpApi}/${operationBase}/statistics/org-emr-visit-stats`;
    return buildUrlWithTs(baseUrl, params);
}

export function getOrgEmrQualityStatsUrl( params) {
    // return `${OpApi}/${operationBase}/statistics/${opType}?${stringify(params)}`;
    let baseUrl = `${OpApi}/${operationBase}/statistics/org-emr-quality-stats`;
    return buildUrlWithTs(baseUrl, params);
}
export function getDoctorEventsStatsUrl(params) {
    // return `${OpApi}/${operationBase}/statistics/${opType}?${stringify(params)}`;
    let baseUrl = `${OpApi}/${operationBase}/statistics/org-doctor-stats`;
    return buildUrlWithTs(baseUrl, params);
}

// notification api
export function getNotificationListUrl(params) {
	// return `${OpApi}/${operationBase}/notification?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/notification`;
	return buildUrlWithTs(baseUrl, params);
}

export function getNotificationOneUrl(id) {
	// return `${OpApi}/${operationBase}/notification/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/notification/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

// model api
export function getModelListUrl(params) {
	// return `${OpApi}/${operationBase}/model?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/model`;
	return buildUrlWithTs(baseUrl, params);
}

export function getModelOneUrl(id) {
	// return `${OpApi}/${operationBase}/model/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/model/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

// model-source mapping api
export function getModelVDMappingListUrl(params) {
	// return `${OpApi}/${operationBase}/model-virtual-dept?${stringify(params)}`;
	let baseUrl = `${OpApi}/${operationBase}/model-virtual-dept`;
	return buildUrlWithTs(baseUrl, params);
}

export function getModelVDMappingOneUrl(id) {
	// return `${OpApi}/${operationBase}/model-virtual-dept/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/model-virtual-dept/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

// virtual-department package URLs
export function getVDPackageListUrl() {
	// return `${OpApi}/${operationBase}/virtual-department-package`;
	let baseUrl = `${OpApi}/${operationBase}/virtual-department-package`;
	return buildUrlWithTs(baseUrl, {});
}

export function getVDPackageOneUrl(id) {
	// return `${OpApi}/${operationBase}/virtual-department-package/${id}`;
	let baseUrl = `${OpApi}/${operationBase}/virtual-department-package/${id}`;
	return buildUrlWithTs(baseUrl, {});
}

// service health check
export function getServiceHealthCheckResultsUrl() {
    // return `${OpApi}/${operationBase}/service-health-check`;
	let baseUrl = `${OpApi}/${operationBase}/service-health-check`;
	return buildUrlWithTs(baseUrl, {});
}

// service referral statistics
export function getOrgReferralStatsUrl(params) {
  // return `${OpApi}/${operationBase}/org-referral-stats?${stringify(params)}`;
  let baseUrl = `${OpApi}/${operationBase}/org-referral-stats`;
  return buildUrlWithTs(baseUrl, params);
}

export function getTotalReferralStatsUrl(params) {
  // return `${OpApi}/${operationBase}/total-referral-stats?${stringify(params)}`;
  let baseUrl = `${OpApi}/${operationBase}/total-referral-stats`;
  return buildUrlWithTs(baseUrl, params);
}

export function getOrgReferAcceptTopNUrl(params) {
    // return `${OpApi}/${operationBase}/org-refer-accept-stats?${stringify(params)}`;
    let baseUrl = `${OpApi}/${operationBase}/org-refer-accept-stats`;
    return buildUrlWithTs(baseUrl, params);
}

// service for feedback
export function getFeedbackListUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/feedback`;
	return buildUrlWithTs(baseUrl, params);
}

// service for suggest format
export function getOrgSuggestFormatListUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/org-suggest-format`;
	return buildUrlWithTs(baseUrl, params);
}

export function getOrgSuggestFormatOneUrl(mappingId) {
	let baseUrl = `${OpApi}/${operationBase}/org-suggest-format/${mappingId}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getOrgSuggestFormatCandidatesUrl() {
	let baseUrl = `${OpApi}/${operationBase}/org-suggest-format/candidates`;
	return buildUrlWithTs(baseUrl, {});
}

//service for department config
export function getDepartmentAIConfigListUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/department-ai-config`;
	return buildUrlWithTs(baseUrl, params);
}

export function getDepartmentAIConfigOneUrl(configId) {
	let baseUrl = `${OpApi}/${operationBase}/department-ai-config/${configId}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getDepartmentUIConfigListUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/department-ui-config`;
	return buildUrlWithTs(baseUrl, params);
}

export function getDepartmentUIConfigOneUrl(configId) {
	let baseUrl = `${OpApi}/${operationBase}/department-ui-config/${configId}`;
	return buildUrlWithTs(baseUrl, {});
}

// visit info apis
export function getVisitInfoListUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/visit-info-push`;
	return buildUrlWithTs(baseUrl, params);
}

export function getVisitInfoOneUrl(itemId) {
	let baseUrl = `${OpApi}/${operationBase}/visit-info-push-one`;
	return buildUrlWithTs(baseUrl, {id: itemId});
}

export function mergeTemplateOneUrl() {
	let baseUrl = `${OpApi}/${operationBase}/template/merge`;
	return buildUrlWithTs(baseUrl, {});
}

// gfy demo
export function getGfyExperimentListUrl() {
    return `${DemoApi}/service/gfy/experiments`;
}

export function getGfyExperimentUrl(params) {
    return `${DemoApi}/service/gfy/experiment?${stringify(params)}`;
}

export function predictGfyDiagnosisUrl() {
    return `${DemoApi}/service/predict/diagnosis`;
}

export function getGfyEmrListUrl() {
    return `${DemoApi}/service/emr/gfy`;
}

export function getGfyEmrUrl(id) {
    return `${DemoApi}/service/emr/gfy/${id}`;
}

// medicine api
export function getStdMedicineListUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/std-medicine`;
	return buildUrlWithTs(baseUrl, params);
}
export function getStdMedicineOneUrl(medicineId) {
	let baseUrl = `${OpApi}/${operationBase}/std-medicine/${medicineId}`;
	return buildUrlWithTs(baseUrl, {});
}
export function getOrgMedicineListUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/org-medicine`;
	return buildUrlWithTs(baseUrl, params);
}
export function getOrgMedicineOneUrl(medicineId) {
	let baseUrl = `${OpApi}/${operationBase}/org-medicine/${medicineId}`;
	return buildUrlWithTs(baseUrl, {});
}
export function getMedicineMappingListUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/medicine-mapping`;
	return buildUrlWithTs(baseUrl, params);
}
export function getMedicineMappingOneUrl(mappingId) {
	let baseUrl = `${OpApi}/${operationBase}/medicine-mapping/${mappingId}`;
	return buildUrlWithTs(baseUrl, {});
}

// associated symptom api
export function getAssociatedSymptomListUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/associate-symptom`;
	return buildUrlWithTs(baseUrl, params);
}
export function getAssociatedSymptomOneUrl(mappingId) {
	let baseUrl = `${OpApi}/${operationBase}/associate-symptom/${mappingId}`;
	return buildUrlWithTs(baseUrl, {});
}

// track log api
export function getTrackLogListUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/track-log`;
	return buildUrlWithTs(baseUrl, params);
}
export function getTrackLogOneUrl(logId) {
	let baseUrl = `${OpApi}/${operationBase}/track-log/${logId}`;
	return buildUrlWithTs(baseUrl, {});
}

// track auth api
export function getTrackAuthLogListUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/track-auth`;
	return buildUrlWithTs(baseUrl, params);
}
export function getTrackAuthLogOneUrl(logId) {
	let baseUrl = `${OpApi}/${operationBase}/track-auth/${logId}`;
	return buildUrlWithTs(baseUrl, {});
}
export function getTrackAuthLogCompareUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/track-auth/compare`;
	return buildUrlWithTs(baseUrl, params);
}
export function getTrackAuthLogOneNlpUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/track-auth/${params.id}/nlp`;
	return buildUrlWithTs(baseUrl, {mode: params.mode});
}

// 11-14 日添加 检查报告demo的url, exam_report_list就是对应flask后台的route 
// 获取所有报告的文本列表
export function getExamReportListUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/exam_report_list`;
	return buildUrlWithTs(baseUrl, params);
}

//获取单个报告的 结构化+归一化 数据
export function getExamReportResultOneUrl(params) {
	let baseUrl = `${OpApi}/${operationBase}/exam_standard_one`;
	return buildUrlWithTs(baseUrl, params);
}

export function getPrototypeListUrl(params) {
	let baseUrl = `${OpApi}/demo/demo`;
	return buildUrlWithTs(baseUrl, params);
}

export function getPrototypeOneUrl(caseId) {
	let baseUrl = `${OpApi}/demo/demo/${caseId}`;
	return buildUrlWithTs(baseUrl, {});
}

// Ramdis URLs
export function getRamdisListUrl(params) {
	let baseUrl = `${OpApi}/demo/ramdis`;
	return buildUrlWithTs(baseUrl, params);
}

export function getRamdisOneUrl(caseId) {
	let baseUrl = `${OpApi}/demo/ramdis/${caseId}`;
	return buildUrlWithTs(baseUrl, {});
}

// Lonic URLs
export function getLoincListUrl(params) {
	let baseUrl = `${OpApi}/demo/loinc`;
	return buildUrlWithTs(baseUrl, params);
}

export function getLoincOneUrl(caseId) {
	let baseUrl = `${OpApi}/demo/loinc/${caseId}`;
	return buildUrlWithTs(baseUrl, {});
}

// Radlex URLs
export function getRadlexListUrl(params) {
	let baseUrl = `${OpApi}/demo/radlex`;
	return buildUrlWithTs(baseUrl, params);
}

export function getRadlexOneUrl(caseId) {
	let baseUrl = `${OpApi}/demo/radlex/${caseId}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getRadlexParentTreeUrl(rid) {
	let baseUrl = `${OpApi}/demo/radlex-parent`;
	return buildUrlWithTs(baseUrl, {rid: rid});
}

// Radlex Mapping URLs
export function getRadlexMappingListUrl(params) {
	let baseUrl = `${OpApi}/demo/radlex-mapping`;
	return buildUrlWithTs(baseUrl, params);
}

export function getRadlexMappingOneUrl(caseId) {
	let baseUrl = `${OpApi}/demo/radlex-mapping/${caseId}`;
	return buildUrlWithTs(baseUrl, {});
}

// Loinc Mapping URLs
export function getLoincObjMappingListUrl(params) {
	let baseUrl = `${OpApi}/demo/loinc-obj-mapping`;
	return buildUrlWithTs(baseUrl, params);
}

export function getLoincObjMappingOneUrl(caseId) {
	let baseUrl = `${OpApi}/demo/loinc-obj-mapping/${caseId}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getLoincStep0MappingListUrl(params) {
	let baseUrl = `${OpApi}/demo/loinc-step0-mapping`;
	return buildUrlWithTs(baseUrl, params);
}

export function getLoincStep0MappingOneUrl(caseId) {
	let baseUrl = `${OpApi}/demo/loinc-step0-mapping/${caseId}`;
	return buildUrlWithTs(baseUrl, {});
}

// FMA URLs
export function getFMAListUrl(params) {
	let baseUrl = `${OpApi}/demo/fma`;
	return buildUrlWithTs(baseUrl, params);
}

export function getFMAOneUrl(caseId) {
	let baseUrl = `${OpApi}/demo/fma/${caseId}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getFMAParentTreeUrl(rid) {
	let baseUrl = `${OpApi}/demo/fma-parent`;
	return buildUrlWithTs(baseUrl, {code: rid});
}

// SNOMED-CT URLs
export function getSnomedCTListUrl(params) {
	let baseUrl = `${OpApi}/demo/snomed-ct`;
	return buildUrlWithTs(baseUrl, params);
}

export function getSnomedCTOneUrl(caseId) {
	let baseUrl = `${OpApi}/demo/snomed-ct/${caseId}`;
	return buildUrlWithTs(baseUrl, {});
}

export function getSnomedCTOneByCodeUrl(code) {
	let baseUrl = `${OpApi}/demo/snomed-ct-code/${code}`;
	return buildUrlWithTs(baseUrl, {});
}
