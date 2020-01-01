window.OpApi = 'http://localhost:5000/api/v1';
//window.OpApi = 'http://172.18.0.41:6313/api/v1';


window.modulesSupport = [
	'welcome', 'exam-standard'
];
// 'template', 'third-party', 'tagging-normal', 'train-model',
// 'system-operation', 'statistics', 'dashboarder-builder',
window.hideL2Path = {
	'doctor-community': ['emr-case'],
	'exam-standard': ['emr-case'],
	'system-operation': ['track-log-debug', 'visit-info-debug'],
	'statistics': ['overview','org-stats-detail','referral-statistics','referral-accept-statistics']
};
