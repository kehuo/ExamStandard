// window.OpApi = 'http://localhost:5000/api/v1';
window.OpApi = 'http://172.18.0.61:6111/api/v1';
window.RareApi = 'http://172.18.0.61:6111/api/v1';
window.DemoApi = 'http://172.18.0.64:6126/api/v1';
window.modulesSupport = [
	'welcome','notification','admin','common', 'template','tagging-normal',
	'train-model', 'system-operation', 'statistics',
	'rare-disease', 'medicine-suggest', 'exam-suggest',
	'doctor-community'
];
// 'template', 'third-party', 'tagging-normal', 'train-model',
// 'system-operation', 'statistics', 'dashboarder-builder',
window.hideL2Path = {
	'doctor-community': ['emr-case'],
	'system-operation': ['track-log-debug', 'visit-info-debug'],
	'statistics': ['overview','org-stats-detail','referral-statistics','referral-accept-statistics']
};