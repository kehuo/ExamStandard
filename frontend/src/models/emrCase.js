import { getRawEmrCaseList, editRawEmrCase, deleteRawEmrCase, getRawEmrCase,
	getGuideDocumentList, editGuideDocument, deleteGuideDocument, getGuideDocument
} from '@/services/emrCaseOps';
import { getMasterDataList } from '@/services/masterDataOps';
import { message } from 'antd';

export default {
	namespace: 'emrCase',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetchDiseaseList({payload, callback}, { call, put }) {
			const response = yield call(getMasterDataList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取疾病列表数据失败!');
				return;
			}

			if (callback) {
				callback(response.data);
			}
		},

		*fetchCaseList({payload, callback}, { call, put }) {
			const response = yield call(getRawEmrCaseList, payload);
			if (!response.code || response.code != 'SUCCESS') {
				message.error('获取病历列表数据失败!');
				return;
			}

			if (callback) {
				callback(response.data);
			}
		},

		*editCaseOne({payload, callback}, { call, put }) {
			const rs0 = yield call(editRawEmrCase, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('修改病历任务失败!');
				return;
			} else {
				message.success('修改病历任务成功!');
			}

			if (callback) {
				callback(rs0.data.id);
			}
		},

		*getCaseOne({payload, callback}, { call, put }) {
			const rs0 = yield call(getRawEmrCase, payload.id);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('获取病历失败!');
				return;
			} else {
				// message.success('获取病历成功!');
			}

			if (callback) {
				callback(rs0.data);
			}
		},

		*deleteCaseOne({payload, callback}, { call, put }) {
			const rs0 = yield call(deleteRawEmrCase, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('删除病历失败!');
				return;
			} else {
				message.success('删除病历成功!');
			}

			if (callback) {
				callback();
			}
		},

		*fetchGuideListAndFirst({payload, callback}, { call, put }) {
			const rs0 = yield call(getGuideDocumentList, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('获取参考文献列表失败!');
				return;
			} else {
				// message.success('获取参考文献列表成功!');
			}

			let finalData = rs0.data;
			if (rs0.data.documents.length>0) {
				let firstDocId = rs0.data.documents[0].id;
				const rs1 = yield call(getGuideDocument, firstDocId);
				if (!rs1.code || rs1.code != 'SUCCESS') {
					message.error('获取参考文献失败!');
					return;
				} else {
					// message.success('获取参考文献成功!');
					finalData.docOne = rs1.data;
				}
			}

			if (callback) {
				callback(finalData);
			}
		},

		*fetchGuideOne({payload, callback}, { call, put }) {
			const rs0 = yield call(getGuideDocument, payload.id);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('获取参考文献失败!');
				return;
			} else {
				// message.success('获取参考文献成功!');
			}

			if (callback) {
				callback(rs0.data);
			}
		},
	},

	reducers: {
		// dummy
		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.emrs,
				total: payload.total,
			};
		},
	}
};