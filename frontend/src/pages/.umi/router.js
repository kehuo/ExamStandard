import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/lib/renderRoutes';
import history from '@tmp/history';
import RendererWrapper0 from '/Users/hk/dev/ExamStandard/frontend/src/pages/.umi/LocaleWrapper.jsx';
import _dvaDynamic from 'dva/dynamic';

const Router = require('dva/router').routerRedux.ConnectedRouter;

const routes = [
  {
    path: '/user',
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () => import('../../layouts/UserLayout'),
          LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
            .default,
        })
      : require('../../layouts/UserLayout').default,
    routes: [
      {
        path: '/user',
        redirect: '/user/login',
        exact: true,
      },
      {
        path: '/user/userInfo',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../setting/UserInfo'),
              LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                .default,
            })
          : require('../setting/UserInfo').default,
        exact: true,
      },
      {
        path: '/user/login',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../setting/Login'),
              LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                .default,
            })
          : require('../setting/Login').default,
        exact: true,
      },
      {
        path: '/user/register',
        component: __IS_BROWSER
          ? _dvaDynamic({
              app: require('@tmp/dva').getApp(),
              models: () => [
                import('/Users/hk/dev/ExamStandard/frontend/src/pages/User/models/register.js').then(
                  m => {
                    return { namespace: 'register', ...m.default };
                  },
                ),
              ],
              component: () => import('../User/Register'),
              LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                .default,
            })
          : require('../User/Register').default,
        exact: true,
      },
      {
        path: '/user/register-result',
        component: __IS_BROWSER
          ? _dvaDynamic({
              app: require('@tmp/dva').getApp(),
              models: () => [
                import('/Users/hk/dev/ExamStandard/frontend/src/pages/User/models/register.js').then(
                  m => {
                    return { namespace: 'register', ...m.default };
                  },
                ),
              ],
              component: () => import('../User/RegisterResult'),
              LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                .default,
            })
          : require('../User/RegisterResult').default,
        exact: true,
      },
      {
        component: () =>
          React.createElement(
            require('/Users/hk/dev/ExamStandard/frontend/node_modules/umi-build-dev/lib/plugins/404/NotFound.js')
              .default,
            { pagesPath: 'src/pages', hasRoutesInConfig: true },
          ),
      },
    ],
  },
  {
    path: '/',
    component: __IS_BROWSER
      ? _dvaDynamic({
          component: () => import('../../layouts/BasicLayout'),
          LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
            .default,
        })
      : require('../../layouts/BasicLayout').default,
    Routes: [require('../Authorized').default],
    routes: [
      {
        path: '/',
        redirect: '/user/login',
        exact: true,
      },
      {
        path: '/welcome',
        name: 'welcome',
        icon: 'home',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../Welcome/Welcome'),
              LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                .default,
            })
          : require('../Welcome/Welcome').default,
        authority: ['admin', 'virtualdept', 'support'],
        exact: true,
      },
      {
        path: '/notification',
        name: 'notification',
        component: __IS_BROWSER
          ? _dvaDynamic({
              component: () => import('../Notification/NotificationList'),
              LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                .default,
            })
          : require('../Notification/NotificationList').default,
        authority: ['admin', 'support'],
        hideInMenu: true,
        exact: true,
      },
      {
        path: '/exam-standard',
        name: 'exam-standard',
        icon: 'team',
        authority: ['admin', 'virtualdept', 'dataengineer'],
        routes: [
          {
            path: '/exam-standard/show-exam-report-list',
            name: 'show-exam-report-list',
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import('../ExamStandard/ShowExamReportList'),
                  LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                    .default,
                })
              : require('../ExamStandard/ShowExamReportList').default,
            exact: true,
          },
          {
            path: '/exam-standard/show-exam-report-result-one',
            name: 'show-exam-report-result-one',
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () =>
                    import('../ExamStandard/ShowExamReportResultOne'),
                  LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                    .default,
                })
              : require('../ExamStandard/ShowExamReportResultOne').default,
            hideInMenu: true,
            exact: true,
          },
          {
            path: '/exam-standard/prototype-list',
            name: 'prototype-list',
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import('../ExamStandard/PrototypeList'),
                  LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                    .default,
                })
              : require('../ExamStandard/PrototypeList').default,
            exact: true,
          },
          {
            path: '/exam-standard/prototype-one',
            name: 'prototype-one',
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import('../ExamStandard/PrototypeOne'),
                  LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                    .default,
                })
              : require('../ExamStandard/PrototypeOne').default,
            hideInMenu: true,
            exact: true,
          },
          {
            path: '/exam-standard/ramdis-list',
            name: 'ramdis-list',
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import('../ExamStandard/RamdisList'),
                  LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                    .default,
                })
              : require('../ExamStandard/RamdisList').default,
            exact: true,
          },
          {
            path: '/exam-standard/ramdis-one',
            name: 'ramdis-one',
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import('../ExamStandard/RamdisOnePanel'),
                  LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                    .default,
                })
              : require('../ExamStandard/RamdisOnePanel').default,
            hideInMenu: true,
            exact: true,
          },
          {
            path: '/exam-standard/loinc-list',
            name: 'loinc-list',
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import('../ExamStandard/LoincList'),
                  LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                    .default,
                })
              : require('../ExamStandard/LoincList').default,
            exact: true,
          },
          {
            path: '/exam-standard/radlex-list',
            name: 'radlex-list',
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import('../ExamStandard/RadlexList'),
                  LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                    .default,
                })
              : require('../ExamStandard/RadlexList').default,
            exact: true,
          },
          {
            path: '/exam-standard/radlex-mapping-list',
            name: 'radlex-mapping-list',
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import('../ExamStandard/RadlexMappingList'),
                  LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                    .default,
                })
              : require('../ExamStandard/RadlexMappingList').default,
            exact: true,
          },
          {
            path: '/exam-standard/loincObj-mapping-list',
            name: 'loincObj-mapping-list',
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () =>
                    import('../ExamStandard/LonicObjMappingList'),
                  LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                    .default,
                })
              : require('../ExamStandard/LonicObjMappingList').default,
            exact: true,
          },
          {
            path: '/exam-standard/loincStep0-mapping-list',
            name: 'loincStep0-mapping-list',
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () =>
                    import('../ExamStandard/LoincStep0MappingList'),
                  LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                    .default,
                })
              : require('../ExamStandard/LoincStep0MappingList').default,
            exact: true,
          },
          {
            path: '/exam-standard/fma-list',
            name: 'fma-list',
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import('../ExamStandard/FMAList'),
                  LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                    .default,
                })
              : require('../ExamStandard/FMAList').default,
            exact: true,
          },
          {
            path: '/exam-standard/snomed-ct-list',
            name: 'snomed-ct-list',
            component: __IS_BROWSER
              ? _dvaDynamic({
                  component: () => import('../ExamStandard/SnomedCTList'),
                  LoadingComponent: require('/Users/hk/dev/ExamStandard/frontend/src/components/PageLoading/index')
                    .default,
                })
              : require('../ExamStandard/SnomedCTList').default,
            exact: true,
          },
          {
            component: () =>
              React.createElement(
                require('/Users/hk/dev/ExamStandard/frontend/node_modules/umi-build-dev/lib/plugins/404/NotFound.js')
                  .default,
                { pagesPath: 'src/pages', hasRoutesInConfig: true },
              ),
          },
        ],
      },
      {
        component: () =>
          React.createElement(
            require('/Users/hk/dev/ExamStandard/frontend/node_modules/umi-build-dev/lib/plugins/404/NotFound.js')
              .default,
            { pagesPath: 'src/pages', hasRoutesInConfig: true },
          ),
      },
    ],
  },
  {
    component: () =>
      React.createElement(
        require('/Users/hk/dev/ExamStandard/frontend/node_modules/umi-build-dev/lib/plugins/404/NotFound.js')
          .default,
        { pagesPath: 'src/pages', hasRoutesInConfig: true },
      ),
  },
];
window.g_routes = routes;
const plugins = require('umi/_runtimePlugin');
plugins.applyForEach('patchRoutes', { initialValue: routes });

export { routes };

export default class RouterWrapper extends React.Component {
  unListen() {}

  constructor(props) {
    super(props);

    // route change handler
    function routeChangeHandler(location, action) {
      plugins.applyForEach('onRouteChange', {
        initialValue: {
          routes,
          location,
          action,
        },
      });
    }
    this.unListen = history.listen(routeChangeHandler);
    // dva 中 history.listen 会初始执行一次
    // 这里排除掉 dva 的场景，可以避免 onRouteChange 在启用 dva 后的初始加载时被多执行一次
    const isDva =
      history.listen
        .toString()
        .indexOf('callback(history.location, history.action)') > -1;
    if (!isDva) {
      routeChangeHandler(history.location);
    }
  }

  componentWillUnmount() {
    this.unListen();
  }

  render() {
    const props = this.props || {};
    return (
      <RendererWrapper0>
        <Router history={history}>{renderRoutes(routes, props)}</Router>
      </RendererWrapper0>
    );
  }
}
