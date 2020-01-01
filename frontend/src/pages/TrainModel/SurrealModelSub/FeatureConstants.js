export const BinDescription = [
	{
		name: '当做枚举变量',
		description: '使用多个维度表征其变量。',
	},
	{
		name: '枚举值集合',
		description: '二值 -- 两个维度分别表示未发生和发生\n三值 -- 两个维度分别表示未发生、发生和未知。',
	},
];

export const NumberDescription = [
	{
		name: '数值变量',
		description: '允许变量使用连续数值表征其特性。',
	},
];

export const TimeDescription = [
	{
		name: '出现时间',
		description: '症状出现距问诊之间的天数或与其相关(可经数学变换后)的数值。',
	},
	{
		name: '持续时间',
		description: '症状持续天数或与其相关(可经数学变换后)的数值。',
	},
];

export const OneHotDescription = [
	{
		name: '普通检验/检查',
		description: '普通检验/检查结果默认为二值(如正常与异常,或阴性和阳性),也可根据实际数据支持四值(正常、异常、过高和过低)。',
	},
	{
		name: '特定检验/检查',
		description: '特定检验/检查结果为枚举值,如(I II III等级别描述)。',
	},
	{
		name: '部位扩展',
		description: '除名称外,症状一般需要结合部位,故部位作为一类特殊的扩展属性存在,且建立独立矢量来表征。',
	},
	{
		name: '症状描述',
		description: '除名称外,症状描述中通常还包括严重程度、颜色、形状、特定时段等附加属性,均可以作为症状矢量的扩展属性,从而建立独立的维度来表征。',
	},
];

export const VectorTypeOpts = [
	{k:'症状',v:'symptom'},
	{k:'疾病',v:'disease'},
	{k:'检查',v:'exam'},
	{k:'治疗',v:'treatment'}
];
