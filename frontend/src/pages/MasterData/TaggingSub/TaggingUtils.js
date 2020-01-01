export const StatusDict = {
	'EMPTY':'待处理','WORKING':'处理中','FINISHED':'完成', 'CONFIRMED':'已确认'
};
export const StatusOpts = [
	{v:'EMPTY', k:'待处理'}, {v:'WORKING', k:'处理中'},
	{v:'FINISHED', k:'完成'}, {v:'CONFIRMED', k:'已确认'},
	{v:'all', k:'全部'}
];
export const StatusOptsNoAll = [
	{v:'EMPTY', k:'待处理'}, {v:'WORKING', k:'处理中'},
	{v:'FINISHED', k:'完成'}, {v:'CONFIRMED', k:'已确认'},
];

export const ContentTypeDict  = {
	'COMPLAINT':'主诉','PHYSICAL':'体格检查','PRESENT':'现病史',
	'PAST':'既往史','FAMILY':'家族史','ALLERGY':'过敏史'
};
export const ContentTypeOpts  = [
	{v:'COMPLAINT', k:'主诉'},{v:'PHYSICAL', k:'体格检查'},{v:'PRESENT', k:'现病史'},
	{v:'PAST', k:'既往史'},{v:'FAMILY', k:'家族史'},{v:'ALLERGY', k:'过敏史'},
	{v:'all', k:'全部'}
];

export const TagColorSetting = [
	{"name":"symptom","description":"症状","color":"#FF7646"},
	{"name":"symptom_pos","description":"方位","color":"#FF9D4A"},
	{"name":"symptom_obj","description":"解剖/生理","color":"#EFB041"},
	//新增 object_part/lesion/lesion_desc/reversed_exam_result/reversed_exam_item
	{"name":"object_part","description":"局部部位/通用","color":"#ea1f1f"},
	{"name":"lesion","description":"病灶","color":"#db5886"},
	{"name":"lesion_desc","description":"病灶描述","color":"#d22269"},
	{"name":"reversed_exam_result","description":"逆序检查结果","color":"#ea1fc3"},
	{"name":"reversed_exam_item,","description":"逆序检查项","color":"#dd86cc"},

	{"name":"symptom_desc","description":"临床表现","color":"#FFCC00"},
	{"name":"symptom_deco","description":"症状特性/修饰","color":"#FFED75"},
	{"name":"exam","description":"检查","color":"#98CE61"},
	{"name":"exam_item","description":"检查项","color":"#C2F2B1"},
	{"name":"exam_result","description":"检查结果","color":"#8B91D1"},
	{"name":"disease","description":"疾病","color":"#DC77AA"},
	{"name":"medicine","description":"药物","color":"#FFA0CE"},
	{"name":"medicine_desc","description":"药物修饰","color":"#6D8EE5"},
	{"name":"treatment","description":"治疗","color":"#A0B5F2"},
	{"name":"treatment_desc","description":"治疗修饰","color":"#6CBFE3"},
	{"name":"disease_desc","description":"疾病修饰","color":"#79D3CE"},
	{"name":"entity_neg","description":"否定","color":"#80D9E7"},
	{"name":"desc_type","description":"病史类型描述","color":"#AEF1F1"},
	{"name":"medical_events","description":"医疗事件","color":"#D0D07B"},
	{"name":"time","description":"时间","color":"#E0E09C"},
	{"name":"pathogen","description":"病因","color":"#CDD5EA"},
	{"name":"vector_seg","description":"矢量段落","color":"#c4e1ff"},
];

export function mockData() {
	let x = {
		"parseWordsSeq":[[0, 1, "null"], [2, 3, "null"], [4, 4, "null"], [5, 6, "null"], [7, 8, "null"], [9, 9, "null"], [10, 11, "null"], [12, 12, "null"], [13, 14, "null"], [15, 15, "null"], [16, 17, "null"], [18, 19, "null"], [20, 21, "null"], [22, 23, "null"], [24, 24, "null"]],
		"entity":[[0, 1, "symptom", "发热"], [2, 3, "time", "三天"], [4, 4, "vector_seg", "，"], [5, 6, "symptom", "呕吐"], [7, 8, "time", "两天"], [9, 9, "vector_seg", "。"], [10, 14, "pathogen", "曾吃过海鲜"], [20, 21, "symptom_deco", "红色"], [22, 23, "symptom_desc", "皮疹"], [24, 24, "vector_seg", "。"]]
	};
	let y = {
		content: "发热三天，呕吐两天。曾吃过海鲜，之后出现红色皮疹。",
		label: JSON.stringify(x)
	};

	return y;
}

export function mockVectors() {
	let lossless = [{"misc": {"deco": [], "tags": [[0, 1, "symptom", "发热"]], "timex3": [{"originalText": "三天", "originalValue": {"Day": "天", "Num": "三"}, "scope": [1, 6], "tid": "t1", "type": "DURATION", "value": "P3D"}]}, "normalization": 0, "source": "default", "text": "发热", "time": "2017-12-09/2017-12-12", "type": "symptom", "value": 1}, {"misc": {"deco": [], "tags": [[5, 6, "symptom", "呕吐"]], "timex3": [{"originalText": "两天", "originalValue": {"Day": "天", "Num": "两"}, "scope": [4, 6], "tid": "t2", "type": "DURATION", "value": "P2D"}]}, "normalization": 0, "source": "default", "text": "呕吐", "time": "2017-12-10/2017-12-12", "type": "symptom", "value": 1}, {"misc": {"deco": [], "tags": [[10, 14, "pathogen", "曾吃过海鲜"]], "timex3": [{}]}, "normalization": 0, "source": "pathogen", "text": "曾吃过海鲜", "time": "2017-12-12", "type": "disease", "value": 1}, {"misc": {"deco": [[20, 21, "symptom_deco", "红色"]], "tags": [[20, 21, "symptom_deco", "红色"], [22, 23, "symptom_desc", "皮疹"]], "timex3": [{}]}, "normalization": 0, "source": "default", "text": "皮疹", "time": "2017-12-12", "type": "symptom_desc", "value": 1}];
	let normalized = [{"code": "R50.900", "misc": {"deco": [], "hpo": [{"code": "HP:0001945", "en_text": "Fever", "text": "发热"}, {"code": "HP:0004370", "en_text": "Abnormality of temperature regulation", "text": "体温调节异常"}], "tags": [[0, 1, "symptom", "发热"]], "timex3": [{"originalText": "三天", "originalValue": {"Day": "天", "Num": "三"}, "scope": [1, 6], "tid": "t1", "type": "DURATION", "value": "P3D"}]}, "normalization": 1, "source": "default", "text": "发热", "time": "2017-12-09/2017-12-12", "type": "symptom", "value": 1}, {"code": "R11.x03", "misc": {"deco": [], "hpo": [{"code": "HP:0002013", "en_text": "Vomiting", "text": "呕吐"}, {"code": "HP:0002017", "en_text": "Nausea and vomiting", "text": "恶心和呕吐"}], "tags": [[5, 6, "symptom", "呕吐"]], "timex3": [{"originalText": "两天", "originalValue": {"Day": "天", "Num": "两"}, "scope": [4, 6], "tid": "t2", "type": "DURATION", "value": "P2D"}]}, "normalization": 1, "source": "default", "text": "呕吐", "time": "2017-12-10/2017-12-12", "type": "symptom", "value": 1}, {"misc": {"deco": [], "tags": [[10, 14, "pathogen", "曾吃过海鲜"]], "timex3": [{}]}, "normalization": 0, "source": "pathogen", "text": "曾吃过海鲜", "time": "2017-12-12", "type": "disease", "value": 1}, {"addition": {"color21x02": [{"code": "A01", "source": "红色", "text": "红色"}]}, "code": "R21.x02", "misc": {"deco": [], "hpo": [{"code": "HP:0000988", "en_text": "Skin rash", "text": "皮疹"}, {"code": "HP:0011123", "en_text": "Inflammatory abnormality of the skin", "text": "皮肤炎症反应"}], "tags": [[20, 21, "symptom_deco", "红色"], [22, 23, "symptom_desc", "皮疹"]], "timex3": [{}]}, "normalization": 1, "source": "default", "text": "皮疹", "time": "2017-12-12", "type": "symptom", "value": 1}];
	let y = {
		lossless: lossless,
		normalized: normalized,
	};
	return y;
}