import { queryTagsList, editTagOne, createTagOne } from '@/services/tags';

export default {
	namespace: 'tags',

	state: {
		tagsList: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, { call, put }) {
			const response = yield call(queryTagsList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				callback('ERROR','获取数据失败');
				return;
			}

			yield put({
				type: 'saveTags',
				payload: response.data,
			});
		},

		*edit({payload, callback}, { call, put }) {
			if (payload.record.id) {
				const response0 = yield call(editTagOne, payload.record);
				if (!response0.code || response0.code != 'SUCCESS') {
					callback('ERROR','修改数据失败');
					return;
				}
			} else {
				const response0 = yield call(createTagOne, payload.record);
				if (!response0.code || response0.code != 'SUCCESS') {
					callback('ERROR','新建数据失败');
					return;
				}
			}

			const response = yield call(queryTagsList, payload.listOpts);
			if (!response.code || response.code != 'SUCCESS') {
				callback('ERROR','获取数据失败');
				return;
			}

			yield put({
				type: 'saveTags',
				payload: response.data,
			});
		},
	},

	reducers: {
		saveTags(state, action) {
			let payload = action.payload;
			return {
				...state,
				tagsList: payload.templates,
				total: payload.total,
			};
		},
	},
};
