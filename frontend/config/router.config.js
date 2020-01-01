export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/userInfo', component: './setting/UserInfo'},
      { path: '/user/login', component: './setting/Login' },
      { path: '/user/register', component: './User/Register' },
      { path: '/user/register-result', component: './User/RegisterResult' },
    ],
  },


  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      // { path: '/', redirect: '/welcome' },
      { path: '/', redirect: '/user/login' },
      {
        path: '/welcome',
        name: 'welcome',
        icon: 'home',
        component: './Welcome/Welcome',
        authority: ['admin', 'virtualdept','support'],
      },
      {
        path: '/notification',
        name: 'notification',
        // icon: 'home',
        component: './Notification/NotificationList',
        authority: ['admin','support'],
        hideInMenu: true,
      },


      // 新添加检查报告结构化展示页面
      {
        path: '/exam-standard',
        name: 'exam-standard',
        icon: 'team',
        authority: ['admin','virtualdept','dataengineer'],
        routes: [
          {
            path: '/exam-standard/show-exam-report-list',
            name: 'show-exam-report-list',
            component: './ExamStandard/ShowExamReportList',
          },
          {
            path: '/exam-standard/show-exam-report-result-one',
            name: 'show-exam-report-result-one',
            component: './ExamStandard/ShowExamReportResultOne',
            hideInMenu: true,
          },
          {
            path: '/exam-standard/prototype-list',
            name: 'prototype-list',
            component: './ExamStandard/PrototypeList',
          },
          {
            path: '/exam-standard/prototype-one',
            name: 'prototype-one',
            component: './ExamStandard/PrototypeOne',
            hideInMenu: true,
          },
          {
            path: '/exam-standard/ramdis-list',
            name: 'ramdis-list',
            component: './ExamStandard/RamdisList',
          },
          {
            path: '/exam-standard/ramdis-one',
            name: 'ramdis-one',
            component: './ExamStandard/RamdisOnePanel',
            hideInMenu: true,
          },
          {
            path: '/exam-standard/loinc-list',
            name: 'loinc-list',
            component: './ExamStandard/LoincList',
          },
          {
            path: '/exam-standard/radlex-list',
            name: 'radlex-list',
            component: './ExamStandard/RadlexList',
          },
          {
            path: '/exam-standard/radlex-mapping-list',
            name: 'radlex-mapping-list',
            component: './ExamStandard/RadlexMappingList',
          },
          {
            path: '/exam-standard/loincObj-mapping-list',
            name: 'loincObj-mapping-list',
            component: './ExamStandard/LonicObjMappingList',
          },
          {
            path: '/exam-standard/loincStep0-mapping-list',
            name: 'loincStep0-mapping-list',
            component: './ExamStandard/LoincStep0MappingList',
          },
          {
            path: '/exam-standard/fma-list',
            name: 'fma-list',
            component: './ExamStandard/FMAList',
          },
          {
            path: '/exam-standard/snomed-ct-list',
            name: 'snomed-ct-list',
            component: './ExamStandard/SnomedCTList',
          },
        ]
      },
    ],
  },
];
