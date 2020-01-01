import dva from 'dva';
import { Component } from 'react';
import createLoading from 'dva-loading';
import history from '@tmp/history';

let app = null;

export function _onCreate() {
  const plugins = require('umi/_runtimePlugin');
  const runtimeDva = plugins.mergeConfig('dva');
  app = dva({
    history,
    
    ...(runtimeDva.config || {}),
    ...(window.g_useSSR ? { initialState: window.g_initialData } : {}),
  });
  
  app.use(createLoading());
  (runtimeDva.plugins || []).forEach(plugin => {
    app.use(plugin);
  });
  
  app.model({ namespace: 'associateSymptom', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/associateSymptom.js').default) });
app.model({ namespace: 'bodyPart', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/bodyPart.js').default) });
app.model({ namespace: 'cnRareDisease', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/cnRareDisease.js').default) });
app.model({ namespace: 'cnRareDiseaseMapping', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/cnRareDiseaseMapping.js').default) });
app.model({ namespace: 'dashboard', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/dashboard.js').default) });
app.model({ namespace: 'dataSource', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/dataSource.js').default) });
app.model({ namespace: 'demoStructure', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/demoStructure.js').default) });
app.model({ namespace: 'department', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/department.js').default) });
app.model({ namespace: 'departmentAIConfig', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/departmentAIConfig.js').default) });
app.model({ namespace: 'departmentUIConfig', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/departmentUIConfig.js').default) });
app.model({ namespace: 'disease', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/disease.js').default) });
app.model({ namespace: 'diseaseExamMapping', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/diseaseExamMapping.js').default) });
app.model({ namespace: 'diseaseSystem', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/diseaseSystem.js').default) });
app.model({ namespace: 'doctorTemplate', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/doctorTemplate.js').default) });
app.model({ namespace: 'doctorTemplateOne', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/doctorTemplateOne.js').default) });
app.model({ namespace: 'emrCase', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/emrCase.js').default) });
app.model({ namespace: 'entitySegment', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/entitySegment.js').default) });
app.model({ namespace: 'exam', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/exam.js').default) });
app.model({ namespace: 'exportNlp', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/exportNlp.js').default) });
app.model({ namespace: 'featureDesignList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/featureDesignList.js').default) });
app.model({ namespace: 'featureDesignOne', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/featureDesignOne.js').default) });
app.model({ namespace: 'feedback', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/feedback.js').default) });
app.model({ namespace: 'fmaList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/fmaList.js').default) });
app.model({ namespace: 'gfyDemo', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/gfyDemo.js').default) });
app.model({ namespace: 'global', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/global.js').default) });
app.model({ namespace: 'heredopathiaHpo', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/heredopathiaHpo.js').default) });
app.model({ namespace: 'hpo', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/hpo.js').default) });
app.model({ namespace: 'hpoMapping', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/hpoMapping.js').default) });
app.model({ namespace: 'interfaceApi', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/interfaceApi.js').default) });
app.model({ namespace: 'list', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/list.js').default) });
app.model({ namespace: 'login', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/login.js').default) });
app.model({ namespace: 'loincList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/loincList.js').default) });
app.model({ namespace: 'loincObjMappingList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/loincObjMappingList.js').default) });
app.model({ namespace: 'loincStep0MappingList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/loincStep0MappingList.js').default) });
app.model({ namespace: 'masterData', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/masterData.js').default) });
app.model({ namespace: 'medicineMappingList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/medicineMappingList.js').default) });
app.model({ namespace: 'mixPanel', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/mixPanel.js').default) });
app.model({ namespace: 'model', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/model.js').default) });
app.model({ namespace: 'modelVDMapping', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/modelVDMapping.js').default) });
app.model({ namespace: 'normal', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/normal.js').default) });
app.model({ namespace: 'notification', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/notification.js').default) });
app.model({ namespace: 'organization', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/organization.js').default) });
app.model({ namespace: 'orgMedicineList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/orgMedicineList.js').default) });
app.model({ namespace: 'orgReferralAcceptStats', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/orgReferralAcceptStats.js').default) });
app.model({ namespace: 'orgSuggestFormat', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/orgSuggestFormat.js').default) });
app.model({ namespace: 'packageList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/packageList.js').default) });
app.model({ namespace: 'packageOne', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/packageOne.js').default) });
app.model({ namespace: 'physicalSegment', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/physicalSegment.js').default) });
app.model({ namespace: 'primaryHealthOrgDetail', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/primaryHealthOrgDetail.js').default) });
app.model({ namespace: 'primaryHealthOverview', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/primaryHealthOverview.js').default) });
app.model({ namespace: 'project', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/project.js').default) });
app.model({ namespace: 'prototypeList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/prototypeList.js').default) });
app.model({ namespace: 'prototypeOne', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/prototypeOne.js').default) });
app.model({ namespace: 'radlexList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/radlexList.js').default) });
app.model({ namespace: 'radlexMappingList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/radlexMappingList.js').default) });
app.model({ namespace: 'ramdisList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/ramdisList.js').default) });
app.model({ namespace: 'ramdisOne', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/ramdisOne.js').default) });
app.model({ namespace: 'rareDiseaseHpo', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/rareDiseaseHpo.js').default) });
app.model({ namespace: 'rareDiseaseHpoMapping', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/rareDiseaseHpoMapping.js').default) });
app.model({ namespace: 'referralStatistics', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/referralStatistics.js').default) });
app.model({ namespace: 'role', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/role.js').default) });
app.model({ namespace: 'serviceHealthCheck', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/serviceHealthCheck.js').default) });
app.model({ namespace: 'setting', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/setting.js').default) });
app.model({ namespace: 'showExamReportList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/showExamReportList.js').default) });
app.model({ namespace: 'showExamReportResultOne', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/showExamReportResultOne.js').default) });
app.model({ namespace: 'showNlpResult', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/showNlpResult.js').default) });
app.model({ namespace: 'snomedCTList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/snomedCTList.js').default) });
app.model({ namespace: 'stat2Feature', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/stat2Feature.js').default) });
app.model({ namespace: 'stdMedicineList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/stdMedicineList.js').default) });
app.model({ namespace: 'taggingTask', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/taggingTask.js').default) });
app.model({ namespace: 'tags', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/tags.js').default) });
app.model({ namespace: 'templateTest', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/templateTest.js').default) });
app.model({ namespace: 'templateUpdateStatus', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/templateUpdateStatus.js').default) });
app.model({ namespace: 'totalTestPanel', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/totalTestPanel.js').default) });
app.model({ namespace: 'trackAuthLog', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/trackAuthLog.js').default) });
app.model({ namespace: 'trackLog', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/trackLog.js').default) });
app.model({ namespace: 'trainDataConfigList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/trainDataConfigList.js').default) });
app.model({ namespace: 'trainDataConfigOne', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/trainDataConfigOne.js').default) });
app.model({ namespace: 'trainTask', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/trainTask.js').default) });
app.model({ namespace: 'user', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/user.js').default) });
app.model({ namespace: 'userBB', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/userBB.js').default) });
app.model({ namespace: 'userOperationStat', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/userOperationStat.js').default) });
app.model({ namespace: 'vdPackageList', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/vdPackageList.js').default) });
app.model({ namespace: 'vdPackageOne', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/vdPackageOne.js').default) });
app.model({ namespace: 'virtualDepartment', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/virtualDepartment.js').default) });
app.model({ namespace: 'visitInfo', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/visitInfo.js').default) });
app.model({ namespace: 'worldRareDisease', ...(require('/Users/hk/dev/ExamStandard/frontend/src/models/worldRareDisease.js').default) });
  return app;
}

export function getApp() {
  return app;
}

export class _DvaContainer extends Component {
  render() {
    const app = getApp();
    app.router(() => this.props.children);
    return app.start()();
  }
}
