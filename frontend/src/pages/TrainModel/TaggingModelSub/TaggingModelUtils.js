export const SummaryItems = [
	{tag:'precision', title:'准确度'},
];

export const DetailItems = [
	{tag:'S', title:'症状'},
	{tag:'SD', title:'症状特性/修饰'},
	{tag:'SS', title:'临床表现'},
	{tag:'SO', title:'解剖/生理'},
	{tag:'SP', title:'方位'},
	{tag:'E', title:'检查'},
	{tag:'EI', title:'检查项'},
	{tag:'ER', title:'检查结果'},
	{tag:'M', title:'药物'},
	{tag:'MS', title:'药物修饰'},
	{tag:'T', title:'治疗'},
	{tag:'TD', title:'治疗修饰'},
	{tag:'D', title:'疾病'},
	{tag:'DS', title:'疾病修饰'},
	{tag:'N', title:'否定'},
	{tag:'ME', title:'医疗事件'},
	{tag:'DT', title:'病史类型描述'},
	{tag:'X', title:'cont'},
	{tag:'VS', title:'矢量段落'},
	{tag:'P', title:'病因'},
	{tag:'C', title:'时间'},
	{tag:'Z', title:'无标签'},
];
export const Detail2Items = [
	{tag:'precision', title:'准确率'},
	{tag:'recall', title:'召回率'},
	{tag:'f1', title:'无标签'},
];

// {"data": [{
// 	"description": "eval_01",
// 	"type": "tagging",
// 	"updated_at": "2019-03-25 12:38:00",
// 	"created_at": "2019-03-25 12:13:41",
// 	"remark": "tagging task model[version: VER-20190325-121340] is deployed",
// 	"status": "FINISHED",
// 	"tag": "taggingTask$VER-20190325-121340",
// 	"id": 26, "disabled": 0,
// 	"container": "94b4e8585c86f92935d38ca3b715ab63952fe5aec3d3e73f70bd963a7a637905",
// 	"config": "{\"word2vecDim\":\"120\",\"source\":\"taggingData$VER-20190322-124536\",\"includeBase\":true}", "release": 0}],
//
// 	"performance": {
// 		"precision": 0.9609021623961934,
//      "S": {"recall": 0.9595163172223597, "f1": 0.9624940150023941, "precision": 0.9654902518855841},
// 		"SS": {"recall": 0.9712102397554685, "f1": 0.970014978200517, "precision": 0.9688226550291573},
//      "SO": {"recall": 0.9801495609797084, "f1": 0.976958428860065, "precision": 0.9737880084312457},
//      "SD": {"recall": 0.8816973210715714, "f1": 0.8839947885347765, "precision": 0.8863042604501608},
//      "SP": {"recall": 0.9426280074028378, "f1": 0.949658172778123, "precision": 0.9567939887288667},

//      "EI": {"recall": 0.9655747163279698, "f1": 0.9691159438939647, "precision": 0.9726832418469487},
//      "ER": {"recall": 0.9448002439768222, "f1": 0.9580949435596103, "precision": 0.9717691342534505},
//      "E": {"recall": 0.888560157790927, "f1": 0.9122510968612894, "precision": 0.937239944521498},

// 		"MS": {"recall": 0.8140020898641588, "f1": 0.8182773109243697, "precision": 0.82259767687434},
//      "M": {"recall": 0.938676844783715, "f1": 0.9422733077905492, "precision": 0.9458974358974359},

//      "T": {"recall": 0.879074658254469, "f1": 0.8822055137844611, "precision": 0.8853587503309505},
//      "TD": {"recall": 0.7910611461475185, "f1": 0.8384190642255159, "precision": 0.8918083462132921},

//      "D": {"recall": 0.8862634456004232, "f1": 0.9047704770477047, "precision": 0.924066924066924},
// 		"DT": {"recall": 0.883769322235434, "f1": 0.9234353160428638, "precision": 0.9668292682926829},
//      "DS": {"recall": 0.49325337331334335, "f1": 0.6042240587695134, "precision": 0.7796208530805687},

//      "Z": {"recall": 0.939577826386665, "f1": 0.9362948459295878, "precision": 0.9330347277245067},
//      "P": {"recall": 0.9061514195583596, "f1": 0.9326298701298701, "precision": 0.9607023411371237},
//      "N": {"recall": 0.9919401266551525, "f1": 0.991924263988614, "precision": 0.9919084018294048},
//      "C": {"recall": 0.959021113243762, "f1": 0.957183908045977, "precision": 0.9553537284894837},
//      "VS": {"recall": 0.9720119365478247, "f1": 0.9638724347559741, "precision": 0.9558681191952059},
//      "ME": {"recall": 0.9447987454260324, "f1": 0.9474732648353953, "precision": 0.9501629691935654},
//      "X": {"recall": 0.9740695724173071, "f1": 0.9752821527976139, "precision": 0.9764977559267743}},
// "code": "SUCCESS"
// }

function updateBetterTag(perfL, perfR, tag, better) {
	let xl = parseFloat(perfL[tag]);
	let xr = parseFloat(perfR[tag]);
	if (isNaN(xl) || isNaN(xr)) {
		return;
	}
	if (xl > xr) {
		better[tag] = 'down';
	} else if (xl < xr) {
		better[tag] = 'up';
	}
}

export function comparePerformancePair(perfL, perfR) {
	// assuming left is ref, right is what we care about
	let better = {};

	for (let i=0; i<SummaryItems.length; i++) {
		let curI = SummaryItems[i];
		updateBetterTag(perfL, perfR, curI.tag, better);
	}

	for (let j=0; j<DetailItems.length; j++) {
		let curType = DetailItems[j];
		let betterLocal = {};
		let perfLT = perfL[curType.tag];
		let perfRT = perfR[curType.tag];
		for (let i=0; i<Detail2Items.length; i++) {
			let curTag = Detail2Items[i].tag;
			updateBetterTag(perfLT, perfRT, curTag, betterLocal);
		}
		better[curType.tag] = betterLocal;
	}
	return better;
}
