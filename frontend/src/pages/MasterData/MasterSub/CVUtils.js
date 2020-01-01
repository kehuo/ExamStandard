export function buildPropTree(data) {
	let treeData = [];
	for (let i=0; i<data.length; i++) {
		let pA = data[i];
		let children = [];
		for (let j=0; j<pA.props.length; j++) {
			let propA = pA.props[j];
			let childNode = {
				title: propA.name,
				value: ''+propA.id,
				code: propA.code,
			};
			children.push(childNode);
		}
		let parentNode = {
			title: pA.name,
			value: ''+pA.id,
			code: pA.code,
			children: children,
		};
		treeData.push(parentNode);
	}
	return treeData;
}

export function buildInfo(args) {
	let info = [];
	if (!args) {
		return info;
	}

	let argsK = JSON.parse(args);
	const V2KMap = {'gender':'性别','age':'年龄'};
	for (let i=0; i<argsK['info'].length; i++) {
		let k = argsK['info'][i];
		info.push(V2KMap[k]);
	}
	return info;
}

export function findPropKeyId(propTag, propVal, extensions) {
	let propId = null;
	for (let i=0; i<extensions.length; i++) {
		let pA = extensions[i];
		if (pA.code != propTag) {
			continue;
		}
		for (let j=0; j<pA.props.length; j++) {
			let propA = pA.props[j];
			if (propA.name != propVal) {
				continue;
			}
			propId = propA.id;
			break;
		}
		break;
	}
	return propId;
}

export function buildConditions(args, argsExt) {
	let conditions = [];
	if (argsExt.length == 0) {
		return conditions;
	}

	let argsK = JSON.parse(args);
	let vectors = argsK['vectors'];
	for (let i=0; i<argsExt.length; i++) {
		let x = argsExt[i];
		// {
		//      "key":"menarche","name":"生长发育指标","type":"symptom",
		//      "propTag":"type68014bx","prop":"初潮","require":"1","disable":true
		// }
		let v = vectors[i];
		let propId = findPropKeyId(v.propTag, v.prop, x.extensions);
		let y = {
			key0: v.key,
			type: x.type, vector_id: ''+x.vector_id, vectorOpts: [{k:x.vector_name, v:''+x.vector_id}],
			prop_id: ''+propId,
			propTreeData: buildPropTree(x.extensions),
			require: '1',
		};
		conditions.push(y);
	}
	return conditions;
}

export function buildAddition(additionId, additionPropTree) {
	if (!additionId) {
		return '';
	}

	let tgtExt = null;
	let tgtProp = null;
	for (let i=0; i<additionPropTree.length; i++) {
		let curExt = additionPropTree[i];
		for (let j=0; j<curExt.children.length; j++) {
			let curProp = curExt.children[j];
			if (curProp.value == additionId) {
				tgtProp = curProp;
				break;
			}
		}
		if (tgtProp) {
			tgtExt = curExt;
			break;
		}
	}
	if (!tgtExt) {
		return '';
	}
	// {"prop":"次数多","code":"A01","propTag":"frequencyType19400","propId":"177"}
	let x = {
		prop: tgtProp.title, code: tgtProp.code, propId: tgtProp.value,
		propTag: tgtExt.code
	};
	let xStr = JSON.stringify(x);
	return xStr;
}

function getVectorName(vectorId, vectorOpts) {
	let name = '';
	for (let i=0; i<vectorOpts.length; i++) {
		let opt = vectorOpts[i];
		if (opt.v == vectorId) {
			name = opt.k;
			break;
		}
	}
	return name;
}

export function buildArgs(info, conditions) {
	if (info.length == 0 && conditions.length == 0) {
		return '';
	}

	let infoA = [];
	if (info.length > 0) {
		const K2VMap = {'性别':'gender','年龄':'age'};
		for (let i=0; i<info.length; i++) {
			let y = K2VMap[info[i]];
			infoA.push(y);
		}
	}
	// {"vectors":[
	//  {"key":"menarche","name":"生长发育指标","type":"symptom","propTag":"type68014bx","prop":"初潮",
	//  "require":"1","disable":true}],
	// "info":["age","gender"]}
	let vectors = [];
	if (conditions.length > 0) {
		for (let k=0; k<conditions.length; k++) {
			// key: v.key,
			// type: x.type, vector_id: ''+x.vector_id, vectorOpts: [{k:x.vector_name, v:''+x.vector_id}],
			// prop_id: ''+propId, propTreeData: buildPropTree(x.extensions),
			// require: '1',
			let curC = conditions[k];
			let name = getVectorName(curC.vector_id, curC.vectorOpts);

			let tgtExt = null;
			let tgtProp = null;
			for (let i=0; i<curC.propTreeData.length; i++) {
				let curExt = curC.propTreeData[i];
				for (let j=0; j<curExt.children.length; j++) {
					let curProp = curExt.children[j];
					if (curProp.value == curC.prop_id) {
						tgtProp = curProp;
						break;
					}
				}
				if (tgtProp) {
					tgtExt = curExt;
					break;
				}
			}
			let propTag = '';
			if (tgtExt) {
				propTag = tgtExt.code;
			}
			let prop = '';
			if (tgtProp) {
				prop = tgtProp.title;
			}

			let z = {
				key: curC.key0,
				type: curC.type,
				name: name,
				propTag: propTag,
				prop: prop,
				require: curC.require,
			};
			vectors.push(z);
		}
	}
	let x = { info: infoA, vectors: vectors };
	let xStr = JSON.stringify(x);
	return xStr;
}
