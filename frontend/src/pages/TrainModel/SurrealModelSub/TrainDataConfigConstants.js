export const DstDescription = [
	{
		name: '仅使用确诊',
		description: '忽略待查诊断信息,仅使用确诊信息作为目标诊断。',
	},
	{
		name: '仅使用主诊断',
		description: '忽略待查辅助诊断信息,仅使用主诊断作为目标诊断。',
	},
	{
		name: '使用疾病组',
		description: '使用疾病组替代单个疾病诊断。',
	},
	{
		name: '仅包含',
		description: '仅使用设置的疾病作为目标。',
	},
	{
		name: '排除ICD前缀',
		description: '排除ICD前缀为设置的疾病诊断作为目标。',
	},
	// {
	// 	name: '疾病回溯',
	// 	description: '利用ICD编码规则设置疾病归并处理。\n模式匹配 -- 0匹配,如将xxx.y12型始终归并到xxx.y00。\n',
	// },
];

export const SrcDescription = [
	{
		name: '特征设计',
		description: '引用特征设计配置。',
	},
	{
		name: '疾病特征特殊处理',
		description: '删除目标 -- 删除与目标诊断一样的疾病特征。\n删除强相关 -- 删除与目标诊断强相关的疾病特征。\n始终删除 -- 始终删除的相关性很小的疾病特征。',
	},
	{
		name: '仅使用归一特征',
		description: '只使用归一后的信息构建特征空间。',
	},
	{
		name: '仅使用初诊病历',
		description: '只使用初诊病历中的信息构建特征空间。',
	},
	{
		name: '排除特征类型',
		description: '设置模型中需要排除的矢量类型。',
	},
	{
		name: '排除特征',
		description: '设置模型中需要排除的矢量。',
	},
	{
		name: '自动修正病历的矛盾信息',
		description: '根据分析,自动修正病历中的矛盾信息,原则上以阳性特征为准。',
	},
	{
		name: '激活矢量关系',
		description: '使用矢量关系表,产生相关特征。',
	},
	{
		name: '使用废弃数据',
		description: '使用废弃的病历数据。',
	},
	// {
	// 	name: '设置身体部位回溯',
	// 	description: '使用身体部位回溯,减少文字上身体部位描述差异导致的特征分散。',
	// },
];

export const YesNoOpts = [
	{k:'是', v:'1'}, {k:'否', v:'0'}
];

export const VectorTypeOpts = [
	{k:'症状',v:'symptom'},
	{k:'疾病',v:'disease'},
	{k:'检查',v:'exam'},
	{k:'治疗',v:'treatment'}
];
