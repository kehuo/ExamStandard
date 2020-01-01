
export function buildSymptomData(data) {
	let rst = [];
	if (data.length == 0) {
		return [];
	}

	for (let i=0; i<data.length; i++) {
		let x = data[i];
		if (!x.pos_display) {
			//  console.log(x.vector);
			continue;
		}
		let posStr = x.pos_display+'(有)';
		let y = {
			k: posStr,
			v: posStr,
		};
		rst.push(y);
		let negStr = x.pos_display+'(无)';
		let z = {
			k: negStr,
			v: negStr,
		};
		rst.push(z);
	}
	return rst;
}

export function buildItemData(data) {
	let rst = [];
	if (data.length == 0) {
		return rst;
	}
	for (let i=0; i<data.length; i++) {
		let dataOne = data[i];
		let x = {
			k: dataOne.label,
			v: ''+dataOne.id,
			content: dataOne.content
		};
		rst.push(x);
	}
	return rst;
}
