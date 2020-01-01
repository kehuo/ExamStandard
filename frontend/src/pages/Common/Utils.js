export function buildConditionDisplay(conditions) {
	const tags = ['age', 'gender'];
	const genderMap = {
		'M':'男', 'F':'女'
	};
	const unitMap = {
		'year':'年', 'month':'月', 'day':'天'
	};
	let display = [];
	for (let i = 0; i < tags.length; i++) {
		let tagOne = tags[i];
		let val = conditions[tagOne];
		if (!val) {
			continue;
		}
		switch (tagOne) {
			case 'age':
				display.push('年龄:' + val.start_val + unitMap[val.start_unit] + '~~' + val.end_val + unitMap[val.end_unit]);
				break;
			case 'gender':
				display.push('性别:' + genderMap[val]);
				break;
			default:
				break;
		}
	}
	return (
		<div>
			{display.map( o => (<p>{o}</p>))}
		</div>
	);
}
