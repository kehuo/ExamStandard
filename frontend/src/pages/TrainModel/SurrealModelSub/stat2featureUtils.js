export function buildFeatureList(statData) {
	const vTypes = ['exam','symptom','disease','treatment','medicine'];
	let rst = {};
	for (let i=0; i<vTypes.length; i++) {
		let curType = vTypes[i];
		let curStat = statData[curType];
		let keys = [];
		if (curStat) {
			keys = Object.keys(curStat);
		}
		rst[curType] = keys;
	}
	return rst;
}

function getOrderKeys(stat) {
	let keys = Object.keys(stat);
	keys.sort();
	return keys;
}

function buildChildren(stat, parentIdxs) {
	let babies = []
	let keys = getOrderKeys(stat);
	for (let i=0; i<keys.length; i++) {
		let k = keys[i];
		let curStat = stat[k];
		let idxs = parentIdxs.concat([i]);
		let curNode = {
			title: k,
			key: idxs.join('-'),
		};
		if (typeof(curStat) == 'number') {
			curNode.isLeaf = 1;
			curNode.title = k + ':' + curStat;
		} else {
			let babiesA = buildChildren(curStat, idxs);
			if (babiesA.length == 0) {
				curNode.isLeaf = 1;
				// TODO merge value with key
			} else {
				curNode.children = babiesA;
			}
		}
		babies.push(curNode);
	}
	return babies;
}

export function buildStatTreeData(statistics, vType, feature) {
	if (!statistics[vType] || !statistics[vType][feature]) {
		return [];
	}
	let stat = statistics[vType][feature];

	let rst = [];
	let idx = 0;
	for (let k in stat) {
		let curStat = stat[k];
		let curNode = {
			title: k,
			key: '' + idx,
		};
		let babies = buildChildren(curStat, [idx]);
		if (babies.length == 0) {
			curNode.isLeaf = 1;
		} else {
			curNode.children = babies;
		}
		if (k.indexOf('_未指明') != -1) {
			rst.splice(0, 0, curNode);
		} else {
			rst.push(curNode);
		}
		idx = idx + 1;
	}
	return rst;
}

export function buildDesignCfg(statistics, vType, feature) {
	if (!statistics[vType] || !statistics[vType][feature]) {
		return {};
	}
	let stat = statistics[vType][feature];
	let rst = {
		timeTypes: [],
		vType: 'bin',
	};

	let extension = [];
	let keys = getOrderKeys(stat);
	if (keys.length > 1) {
		extension.push({
			name: '身体部位',
			code: 'bodyObj',
			checked: false,
		});
	}
	for (let i=0; i<keys.length; i++) {
		let k = keys[i];
		let curStat = stat[k];
		if (!curStat instanceof Object) {
			continue;
		}
		let vals = getOrderKeys(curStat);
		for (let j=0; j<vals.length; j++) {
			let curV = vals[j];
			if (['0', '-1', '1', '2', '-2', '7'].indexOf(curV) != -1) {
				continue;
			}
			extension.push({
				name: curV,     //TODO later get name
				code: curV,
				checked: false,
			});
		}
	}
	rst.extension = extension;
	return rst;
}
