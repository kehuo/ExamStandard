import { getDepartmentList, editDepartment, deleteDepartment } from '@/services/departmentOps';
import { getMasterDataListSearch, getMasterDataOneExtension } from '@/services/masterDataOps';
import { message } from 'antd';
import { buildOptionsByTags } from '../utils/utils';

const mockContent = {
	"bin": {
		"enum": 1,
		"value": 2
	},
	"one_hot": [
		{"code": "FYQ01602b", "enums": ["I", "II", "III", "IV", "V"], "text": "腋毛发育分期检查", "type": "exam"},
		{"code": "R23.301", "tags": [{"display": "身体部位", "name": "bodyObj"}], "text": "皮下出血", "type": "symptom"},
		{"code": "R68.016b", "tags": [{"display": "羊水异常数量类型", "enums": ["量多", "量少"], "name": "quantityType68016b"}], "text": "羊水异常", "type": "symptom"},
		{"code": "R19.500", "tags": [{"display": "大便异常颜色类型", "enums": ["白色", "黑色", "黄绿色", "绿色", "墨绿色", "暗色", "黄褐色", "褐色", "黑褐色"], "name": "color19500"}, {"display": "大便异常形态类型", "enums": ["不成形", "干、硬", "黏液样", "稀糊样", "蛋花样", "陶土样", "大便粗", "大便细", "稀水样", "泡沫样", "羊屎样", "湿、软", "含未消化食物", "粘稠", "块状物", "果酱样"], "name": "type19500"}, {"display": "大便异常气味分类", "enums": ["酸臭味", "腥臭味"], "name": "smellType19500"}], "text": "大便异常，其他的", "type": "symptom"}
	],
	"number": [
		{"text":"年龄", "type": "exam"}
	],
	"time": [
		{"text": "下肢水肿", "type": "symptom"},
		{"text": "少尿", "type": "symptom"},
		{"text": "迟钝和反应不良", "type": "symptom"},
	]
};
let mockData = {
	id: 1,
	name: 'will design',
	description: 'it took will 5 days to work out',
	content: JSON.stringify(mockContent),
};

export default {
	namespace: 'trainDataConfigOne',

	state: {
		data: [],
		total: 0,
	},

	effects: {
		*fetch({payload, callback}, {call, put}) {
			// const response = yield call(getDepartmentList, payload);
			// if (!response.code || response.code != 'SUCCESS') {
			// 	message.error('获取科室列表数据失败!');
			// 	return;
			// }

			// if (callback) {
			// 	callback(response.data);
			// }
			callback(mockData);
		},

		*edit({payload, callback}, {call, put}) {
			// const rs0 = yield call(editDepartment, payload.updateParams);
			// if (!rs0.code || rs0.code != 'SUCCESS') {
			// 	message.error('修改科室失败!');
			// 	return;
			// } else {
			// 	message.success('修改科室成功!');
			// }
			message.success('添加或修改特征设计成功!');
			if (callback) {
				callback();
			}
		},

		*queryVector({payload, callback}, {call, put}) {
			const rs0 = yield call(getMasterDataListSearch, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('查询主数据失败!');
				return;
			}

			if (callback) {
				callback(rs0.data.items);
			}
		},

		*queryExtension({payload, callback}, {call, put}) {
			const rs0 = yield call(getMasterDataListSearch, payload);
			if (!rs0.code || rs0.code != 'SUCCESS') {
				message.error('查询主数据失败!');
				return;
			}
			let tgt = null;
			for (let i=0; i<rs0.data.items.length; i++) {
				let curI = rs0.data.items[i];
				if (curI.code == payload.code && curI.text == payload.text) {
					tgt = curI.id;
					break;
				}
			}
			if (!tgt) {
				message.error('精确匹配主数据失败!');
				return;
			}

			const rs1 = yield call(getMasterDataOneExtension, payload.type, tgt);
			if (!rs1.code || rs1.code != 'SUCCESS') {
				message.error('查询扩展失败!');
				return;
			}

			if (callback) {
				callback(rs1.data);
			}
		},
	},

	reducers: {
		saveList(state, action) {
			let payload = action.payload;
			return {
				...state,
				data: payload.departments,
				total: payload.total,
			};
		},
	}
};
