import { getGfyExperimentList, getGfyExperiment, getGfyEmr, getGfyEmrList, predictDiagnosis } from '@/services/gfyDemoOps';

const _ = require('lodash');

export default {
	namespace: 'gfyDemo',

	state: {
        experimentList: [],
        experiment: {},
        top: 15,
        emrList: [],
        emr: {},
        diagnosis: {},
	},

	effects: {
        *fetch({payload, callback}, {call, put}) {
            const responseList = yield call(getGfyExperimentList);
            if (!_.isEmpty(responseList)) {
                yield put ({
                    type: 'saveExperimentList',
                    payload: responseList,
                });

                const response = yield call(getGfyExperiment, { top: payload.top, id: responseList[0].id });
                if (response) {
                    yield put ({
                        type: 'saveExperiment',
                        payload: response,
                    });
                    if (callback) {
                        callback(response);
                    }
                }
            }
        },

		*fetchExperimentList({payload, callback}, {call, put}) {
            const responseList = yield call(getGfyExperimentList);
            if (!_.isEmpty(responseList)) {
                yield put ({
                    type: 'saveExperimentList',
                    payload: responseList,
                });
            }
			
        },

        *fetchExperiment({payload, callback}, {call, put}){
            const response = yield call(getGfyExperiment, payload);
            if (response) {
                yield put ({
                    type: 'saveExperiment',
                    payload: response,
                });
                if (callback) {
                    callback(response);
                }
            }
        },

        *fetchEmrList({payload, callback}, {call, put}) {
            const response = yield call(getGfyEmrList);
            if (response) {
                yield put({
                    type: 'saveEmrList',
                    payload: response.data.emrs || [],
                });
            }
        },

        *fetchEmr({id, callback}, {call, put}) {
            const response = yield call(getGfyEmr, id);
            if (response) {
                yield put({
                    type: 'saveEmr',
                    payload: response.data && response.data.emr || {},
                });
            }
            if (response && callback) {
                callback(response.data && response.data.emr || {});
            }
        },

        *predictDiagnosis({payload, callback}, {call, put}) {
            const response = yield call(predictDiagnosis, payload);
            if (response) {
                yield put({
                    type: 'saveDiagnosis',
                    payload: response.data,
                });
            }
        },
        // *clearDiagnosis({payload}, {call, put}) {
        //     yield put({
        //         type: 'clearDiagnosis',
        //     });
        // }
    },

    reducers: {
		saveExperimentList(state, action) {
            return {
                ...state,
                experimentList: action.payload,
            };
        },

        saveExperiment(state, action) {
            return {
                ...state,
                experiment: action.payload,
            };
        },
        
        saveEmrList(state, action) {
            return {
                ...state,
                emrList: action.payload,
            }
        },

        saveEmr(state, action) {
            return {
                ...state,
                emr: action.payload,
            };
        },

        saveDiagnosis(state, action) {
            return {
                ...state,
                diagnosis: action.payload,
            };
        },
	    
        clearDiagnosis(state, action) {
            return {
                ...state,
                diagnosis: {},
            };
        }
    }
}