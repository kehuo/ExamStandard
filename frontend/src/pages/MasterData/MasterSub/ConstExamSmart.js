export const TypeAOpts = [
	{k:'实验室诊断', v:'B', nextOpts:BSub1Opts },
	{k:'病理学诊断', v:'C', nextOpts:CSub1Opts},
	{k:'影像学诊断', v:'E', nextOpts:ESub1Opts},
	{k:'临床诊断', v:'F', nextOpts:BodySystemOpts},
];

export const BSub1Opts = [
	{k:'临床血液学检验', v:'A', nextOpts: []},
	{k:'临床体液检验', v:'B', nextOpts: []},
	{k:'临床化学检验', v:'C', nextOpts: []},
	{k:'临床免疫学检验', v:'D', nextOpts: []},
	{k:'临床微生物与寄生虫学检查', v:'E', nextOpts: []},
	{k:'临床分子生物学检验', v:'F', nextOpts: []},
];

export const CSub1Opts = [
	{k:'尸检病理学诊断', v:'A', nextOpts: CAOpts},
	{k:'细胞病理学检查与诊断', v:'B', nextOpts: CBOpts},
	{k:'组织病理学检查与诊断', v:'C', nextOpts: CCOpts},
	{k:'分子病理学技术与诊断', v:'D', nextOpts: CDOpts},
	{k:'特染和免疫组织化学染色与诊断', v:'E', nextOpts: CEOpts},
	{k:'电子显微镜技术与诊断', v:'F', nextOpts: CFOpts},
	{k:'其它病理学诊断', v:'G', nextOpts: CGpts},
];

export const CGAOpts = [
	{k:'院外会诊病理', v:'A'},
	{k:'组织流式细胞', v:'B'},
	{k:'组织显微分光', v:'C'},
	{k:'其他细胞涂片', v:'D'},
];

export const CGpts = [
	{k:'其它病理学技术诊断', v:'A', nextOpts: CGAOpts},
];

export const CFAOpts = [
	{k:'普通透射电镜', v:'A'},
	{k:'酶组化电镜', v:'B'},
	{k:'免疫电镜', v:'C'},
	{k:'扫描电镜', v:'D'},
];

export const CFOpts = [
	{k:'电镜检查', v:'A', nextOpts: CFAOpts},
];

export const CEAOpts = [
	{k:'特殊染色', v:'A'},
	{k:'酶组织化学染色', v:'B'},
];

export const CEBOpts = [
	{k:'免疫组织化学染色', v:'A'},
	{k:'免疫荧光染色', v:'B'},
];

export const CEOpts = [
	{k:'特殊染色及酶组织化学染色与诊断', v:'A', nextOpts: CEAOpts},
	{k:'免疫组织化学及免疫荧光染色与诊断', v:'B', nextOpts: CEBOpts},
];

export const CDAOpts = [
	{k:'组织/细胞原位', v:'A'},
	{k:'组织/细胞荧光原位', v:'B'},
	{k:'组织/细胞原位脱氧核糖核酸(DNA)多聚酶链式反应', v:'C'},
	{k:'组织/细胞原位核糖核酸(RNA)多聚酶链式反应', v:'D'},
	{k:'组织/细胞荧光定量脱氧核糖核酸(DNA)多聚酶链式反应', v:'E'},
	{k:'组织/细胞荧光定量核糖核酸(RNA)多聚酶链式反应', v:'F'},
	{k:'组织显微', v:'G'},
];

export const CDOpts = [
	{k:'组织／细胞', v:'A', nextOpts: CDAOpts},
];

export const CCBOpts = [
	{k:'冷冻切片病理', v:'A'},
	{k:'特异性感染标本冷冻切片病理', v:'B'},
	{k:'快速石蜡切片病理', v:'C'},
];

export const CCAOpts = [
	{k:'穿刺组织活检病理', v:'A'},
	{k:'活检钳组织活检病理', v:'B'},
	{k:'骨髓组织活检病理', v:'C'},
	{k:'手术标本病理', v:'D'},
	{k:'牙/骨骼切片病理', v:'E'},
	{k:'全器官大切片', v:'F'},
];

export const CCOpts = [
	{k:'常规组织病理学诊断', v:'A', nextOpts: CCAOpts},
	{k:'术中冰冻及石蜡快速切片与诊断', v:'B', nextOpts: CCBOpts},
];

export const CBAOpts = [
	{k:'通用细胞病理学检查与诊断', v:'A'},
	{k:'妇科脱落细胞病理学检查与诊断', v:'B'},
	{k:'非妇科脱落细胞病理学检查与诊断', v:'C'},
	{k:'液基薄层细胞检查与诊断', v:'D'},
	{k:'专科液基薄层细胞检查与诊断', v:'E'},
];

export const CBOpts = [
	{k:'细胞检测', v:'A', nextOpts: CBAOpts},
];

export const CAOpts = [
	{k:'尸检病理学诊断', v:'A', nextOpts: CAAOpts},
	{k:'尸体防腐、防护处理', v:'B', nextOpts: CABOpts},
];

export const CABOpts = [
	{k:'尸体防腐化学', v:'A'},
	{k:'尸体防腐其他', v:'B'},

];

export const CAAOpts = [
	{k:'常规尸检', v:'A'},
	{k:'常规尸检含部位', v:'B'},
	{k:'常规尸检3岁以下儿童', v:'C'},
	{k:'常规尸检胎儿和新生儿', v:'D'},
];

export const ESub1Opts = [
	{k:'X线检查', v:'A', nextOpts:EAOpts},
	{k:'X线计算机体层检查', v:'B', nextOpts:EBOpts},
	{k:'磁共振检查', v:'C', nextOpts:ECOpts},
	{k:'超声诊断', v:'D', nextOpts:EDOpts},
	{k:'核医学诊断', v:'E', nextOpts:EEOpts},
	{k:'其它成像检查', v:'F', nextOpts:EFOpts},
];

export const EFOpts = [
	{k:'其它检查项目', v:'Z', nextOpts: BodySystemOpts},
];

export const EEOpts = [
	{k:'静态显像与功能测验', v:'A', nextOpts: BodySystemOpts},
	{k:'动态显像', v:'B', nextOpts: BodySystemOpts},
	{k:'断层显像', v:'C', nextOpts: BodySystemOpts},
	{k:'断层融合显像', v:'D', nextOpts: BodySystemOpts},
	{k:'正电子发射断层显像', v:'E', nextOpts: BodySystemOpts},
	{k:'正电子发射断层融合显像', v:'F', nextOpts: BodySystemOpts},
	{k:'核素功能试验', v:'G', nextOpts: BodySystemOpts},
];

export const EDOpts = [
	{k:'A超', v:'A', nextOpts: BodySystemOpts},
	{k:'B超', v:'B', nextOpts: BodySystemOpts},
	{k:'彩色多普勒超声', v:'C', nextOpts: BodySystemOpts},
	{k:'多普勒超声', v:'D', nextOpts: BodySystemOpts},
	{k:'三维超声', v:'E', nextOpts: BodySystemOpts},
	{k:'心脏超声', v:'F', nextOpts: BodySystemOpts},
];

export const ECOpts = [
	{k:'成像', v:'A', nextOpts: BodySystemOpts},
	{k:'增强成像', v:'B', nextOpts: BodySystemOpts},
	{k:'特殊检查', v:'C', nextOpts: BodySystemOpts},
];

export const EBOpts = [
	{k:'平扫', v:'A', nextOpts: BodySystemOpts},
	{k:'增强扫描', v:'B', nextOpts: BodySystemOpts},
	{k:'特殊三维成像', v:'C', nextOpts: BodySystemOpts},
];

export const EAOpts = [
	{k:'诱视', v:'A', nextOpts: BodySystemOpts},
	{k:'摄影', v:'B', nextOpts: BodySystemOpts},
	{k:'造影', v:'C', nextOpts: BodySystemOpts},
	{k:'其它', v:'Z', nextOpts: BodySystemOpts},
];

export const ABodyOpts = [];

export const BBodyOpts = [
	{k:'硬脑膜', v:'A'},
	{k:'蛛网膜', v:'B'},
	{k:'软脑膜', v:'C'},
	{k:'脑室', v:'D'},
	{k:'大脑', v:'E'},
	{k:'脑干', v:'F'},
	{k:'丘脑', v:'G'},
	{k:'幕上', v:'H'},
	{k:'小脑', v:'J'},
	{k:'颅底', v:'K'},
	{k:'颅内', v:'L'},
	{k:'嗅神经', v:'M'},
	{k:'视神经', v:'N'},
	{k:'动眼神经', v:'P'},
	{k:'滑车神经', v:'Q'},
	{k:'三叉神经', v:'R'},
	{k:'展神经', v:'S'},
	{k:'面神经', v:'T'},
	{k:'前庭神经', v:'U'},
	{k:'舌咽神经', v:'V'},
	{k:'迷走神经', v:'W'},
	{k:'副神经', v:'X'},
	{k:'舌下神经', v:'Y'},
	{k:'大脑动脉', v:'1'},
	{k:'大脑静脉', v:'2'},
	{k:'脑血管', v:'3'},
	{k:'脊髓被膜', v:'4'},
	{k:'椎管', v:'5'},
	{k:'脊髓', v:'6'},
	{k:'脊髓血管', v:'7'},
	{k:'中枢神经其它', v:'8'},
];

export const CBodyOpts = [
	{k:'脊神经根', v:'A'},
	{k:'颈脊神经根', v:'B'},
	{k:'胸脊神经根', v:'C'},
	{k:'腰骶脊神经根', v:'D'},
	{k:'颈丛神经', v:'E'},
	{k:'臂丛神经', v:'F'},
	{k:'胸神经前支', v:'G'},
	{k:'腰丛神经', v:'H'},
	{k:'股外侧皮神经', v:'J'},
	{k:'股神经', v:'K'},
	{k:'闭孔神经', v:'L'},
	{k:'腰骶神经丛', v:'M'},
	{k:'阴部神经', v:'N'},
	{k:'坐骨神经', v:'P'},
	{k:'胫神经', v:'Q'},
	{k:'腓总神经', v:'R'},
	{k:'下肢周围神经干', v:'S'},
	{k:'交感神经', v:'T'},
	{k:'颈交感神经', v:'U'},
	{k:'胸交感神经', v:'V'},
	{k:'腰交感神经', v:'W'},
	{k:'周围神经', v:'X'},
	{k:'其它不可分神经', v:'Y'},
	{k:'其他周围神经系统', v:'Z'},
];

export const DBodyOpts = [
	{k:'垂体', v:'A'},
	{k:'甲状腺', v:'B'},
	{k:'甲状旁腺', v:'C'},
	{k:'胰岛', v:'D'},
	{k:'肾上腺', v:'E'},
	{k:'肾上腺皮质', v:'F'},
	{k:'肾上腺髓质', v:'G'},
	{k:'其他', v:'Z'},
];

export const EBodyOpts = [
	{k:'眼睑', v:'A'},
	{k:'泪器', v:'B'},
	{k:'结膜', v:'C'},
	{k:'角膜', v:'D'},
	{k:'前房', v:'E'},
	{k:'虹膜', v:'F'},
	{k:'睫状体', v:'G'},
	{k:'巩膜', v:'H'},
	{k:'晶状体', v:'J'},
	{k:'玻璃体', v:'K'},
	{k:'脉络膜', v:'L'},
	{k:'视网膜', v:'M'},
	{k:'眼外肌', v:'N'},
	{k:'眼眶', v:'P'},
	{k:'眼球', v:'Q'},
	{k:'眼内', v:'R'},
	{k:'眼其它相关功能', v:'V'},
	{k:'其它不可分眼', v:'Z'},
];

export const FBodyOpts = [
	{k:'耳廓', v:'A'},
	{k:'外耳道', v:'B'},
	{k:'鼓膜', v:'C'},
	{k:'鼓室', v:'D'},
	{k:'听骨', v:'E'},
	{k:'乳突', v:'F'},
	{k:'咽鼓管', v:'G'},
	{k:'内耳', v:'H'},
	{k:'耳', v:'J'},
	{k:'听力功能', v:'K'},
	{k:'前庭功能', v:'L'},
	{k:'其他不可分耳', v:'Z'},
];

export const GBodyOpts = [
	{k:'外鼻', v:'A'},
	{k:'鼻腔', v:'B'},
	{k:'鼻旁窦', v:'D'},
	{k:'鼻', v:'E'},
	{k:'鼻咽', v:'F'},
	{k:'口咽', v:'G'},
	{k:'咽部', v:'H'},
	{k:'喉', v:'J'},
	{k:'扁桃体和腺样体', v:'K'},
];

export const HBodyOpts = [
	{k:'唇部', v:'A'},
	{k:'颊部', v:'B'},
	{k:'腭部', v:'C'},
	{k:'舌', v:'D'},
	{k:'唾液腺', v:'E'},
	{k:'颌面部', v:'F'},
	{k:'颞部', v:'G'},
	{k:'颧骨颧弓', v:'H'},
	{k:'上颌骨', v:'J'},
	{k:'下颌骨', v:'K'},
	{k:'颏部', v:'L'},
	{k:'颞下颌部', v:'M'},
	{k:'颌骨', v:'N'},
	{k:'舌骨', v:'P'},
	{k:'犁骨', v:'Q'},
	{k:'牙体', v:'R'},
	{k:'牙冠', v:'S'},
	{k:'牙髓', v:'T'},
	{k:'根管', v:'U'},
	{k:'牙', v:'V'},
	{k:'牙周', v:'W'},
	{k:'口腔粘膜', v:'X'},
	{k:'口腔', v:'Y'},
	{k:'其他', v:'Z'},
];

export const JBodyOpts = [
	{k:'气管', v:'A'},
	{k:'支气管', v:'B'},
	{k:'肺', v:'C'},
	{k:'胸壁', v:'D'},
	{k:'胸膜', v:'E'},
	{k:'纵隔', v:'F'},
	{k:'横膈', v:'G'},
	{k:'呼吸功能', v:'H'},
	{k:'呼吸系统', v:'K'},
	{k:'其他', v:'Z'},
];

export const KBodyOpts = [
	{k:'右心房', v:'A'},
	{k:'右心室', v:'B'},
	{k:'左心房', v:'C'},
	{k:'左心室', v:'D'},
	{k:'房间隔', v:'E'},
	{k:'室间隔', v:'F'},
	{k:'心房', v:'G'},
	{k:'心室', v:'H'},
	{k:'三尖瓣', v:'K'},
	{k:'二尖瓣', v:'L'},
	{k:'主动脉瓣', v:'M'},
	{k:'肺动脉瓣', v:'N'},
	{k:'房室', v:'P'},
	{k:'心腔', v:'Q'},
	{k:'心传导系', v:'R'},
	{k:'心肌', v:'S'},
	{k:'心脏', v:'T'},
	{k:'心包', v:'U'},
	{k:'心功能', v:'V'},
	{k:'心电功能', v:'W'},
	{k:'血压', v:'X'},
	{k:'其它不可再分心脏及心包', v:'Z'},
];

export const LBodyOpts = [
	{k:'肺动脉', v:'A'},
	{k:'升主动脉', v:'B'},
	{k:'冠状动脉', v:'C'},
	{k:'主动脉', v:'D'},
	{k:'主动脉弓', v:'E'},
	{k:'主动脉根部', v:'F'},
	{k:'颈动脉', v:'G'},
	{k:'上肢动脉', v:'H'},
	{k:'胸主动脉', v:'J'},
	{k:'腹主动脉', v:'K'},
	{k:'胃左动脉', v:'L'},
	{k:'腹腔干动脉', v:'M'},
	{k:'肝总动脉', v:'N'},
	{k:'脾动脉', v:'P'},
	{k:'肠系膜上动脉', v:'Q'},
	{k:'肠系膜下动脉', v:'R'},
	{k:'肾动脉', v:'S'},
	{k:'髂动脉', v:'T'},
	{k:'髂内动脉', v:'U'},
	{k:'股动脉', v:'V'},
	{k:'腘动脉', v:'W'},
	{k:'足动脉', v:'X'},
	{k:'下肢动脉', v:'Y'},
	{k:'其它不可分动脉', v:'Z'},
];

export const MBodyOpts = [
	{k:'肺静脉', v:'A'},
	{k:'上腔静脉', v:'B'},
	{k:'无名静脉', v:'C'},
	{k:'颈内静脉', v:'D'},
	{k:'锁骨下静脉', v:'E'},
	{k:'上肢静脉', v:'F'},
	{k:'腋静脉', v:'G'},
	{k:'下腔静脉', v:'H'},
	{k:'肝静脉', v:'J'},
	{k:'肾静脉', v:'K'},
	{k:'股总静脉', v:'L'},
	{k:'髂静脉', v:'M'},
	{k:'股静脉', v:'N'},
	{k:'腘静脉', v:'P'},
	{k:'下肢浅静脉', v:'Q'},
	{k:'大隐静脉', v:'R'},
	{k:'小隐静脉', v:'S'},
	{k:'下肢静脉', v:'T'},
	{k:'门静脉', v:'U'},
	{k:'肠系膜上下静脉', v:'V'},
	{k:'脾静脉', v:'W'},
	{k:'其它静脉', v:'X'},
	{k:'血管', v:'Y'},
	{k:'心血管', v:'Z'},
];

export const NBodyOpts = [
	{k:'骨髓', v:'A'},
	{k:'干细胞', v:'B'},
	{k:'脾', v:'C'},
	{k:'血液', v:'D'},
	{k:'血液成分', v:'E'},
	{k:'胸腺', v:'F'},
	{k:'体表淋巴结/管', v:'G'},
	{k:'头颈部巴结/管', v:'H'},
	{k:'腋窝淋巴结/管', v:'J'},
	{k:'胸部淋巴结/管', v:'K'},
	{k:'腹部淋巴结/管', v:'L'},
	{k:'腹股沟淋巴结管', v:'M'},
	{k:'上肢淋巴结/管', v:'N'},
	{k:'下肢淋巴结/管', v:'P'},
	{k:'四肢淋巴结/管', v:'Q'},
	{k:'全身淋巴结/管', v:'R'},
	{k:'淋巴结/管', v:'T'},
	{k:'淋巴', v:'U'},
	{k:'其它', v:'Z'},
];

export const PBodyOpts = [
	{k:'食管', v:'A'},
	{k:'食管静脉', v:'B'},
	{k:'胃', v:'C'},
	{k:'贲门', v:'D'},
	{k:'胃底', v:'E'},
	{k:'胃体', v:'F'},
	{k:'幽门', v:'G'},
	{k:'胃血管', v:'H'},
	{k:'小肠', v:'J'},
	{k:'十二指肠', v:'K'},
	{k:'奥狄氏括约肌', v:'L'},
	{k:'空肠', v:'M'},
	{k:'回肠', v:'N'},
	{k:'阑尾', v:'P'},
	{k:'结肠', v:'Q'},
	{k:'乙状结肠', v:'S'},
	{k:'直肠', v:'T'},
	{k:'肛门', v:'U'},
	{k:'肛门括约肌', v:'V'},
	{k:'肛周', v:'W'},
	{k:'肠道', v:'X'},
	{k:'消化道', v:'Y'},
	{k:'其它不可分消化管腔', v:'Z'},
];

export const QBodyOpts = [
	{k:'肝', v:'A'},
	{k:'左半肝', v:'B'},
	{k:'右半肝', v:'C'},
	{k:'肝方叶', v:'D'},
	{k:'中肝叶', v:'E'},
	{k:'肝尾叶', v:'F'},
	{k:'肝叶', v:'G'},
	{k:'肝段', v:'H'},
	{k:'肝门部', v:'J'},
	{k:'肝门部胆管', v:'K'},
	{k:'肝血管', v:'L'},
	{k:'肝动脉', v:'M'},
	{k:'胆囊', v:'N'},
	{k:'胆管', v:'P'},
	{k:'胰腺', v:'Q'},
	{k:'胰管', v:'R'},
	{k:'胆管系统', v:'S'},
	{k:'脐', v:'T'},
	{k:'腹壁', v:'U'},
	{k:'腹膜', v:'V'},
	{k:'膈下', v:'W'},
	{k:'腹股沟', v:'X'},
	{k:'其它不可分消化脏器', v:'Z'},
];

export const RBodyOpts = [
	{k:'肾', v:'A'},
	{k:'肾周', v:'B'},
	{k:'肾盂', v:'C'},
	{k:'输尿管', v:'D'},
	{k:'膀胱', v:'E'},
	{k:'膀胱颈', v:'F'},
	{k:'尿道', v:'G'},
	{k:'前尿道', v:'H'},
	{k:'后尿道', v:'J'},
	{k:'尿路', v:'K'},
	{k:'肾血管', v:'N'},
	{k:'其它不可分泌尿系统', v:'Z'},
];

export const SBodyOpts = [
	{k:'睾丸', v:'A'},
	{k:'附睾', v:'B'},
	{k:'输精管', v:'C'},
	{k:'精索', v:'D'},
	{k:'前列腺', v:'E'},
	{k:'精囊腺', v:'F'},
	{k:'阴囊', v:'G'},
	{k:'阴茎', v:'H'},
	{k:'精液', v:'K'},
	{k:'其它不可分男性生殖系统', v:'Z'},
];

export const TBodyOpts = [
	{k:'卵巢', v:'A'},
	{k:'输卵管', v:'B'},
	{k:'宫颈', v:'C'},
	{k:'宫腔', v:'D'},
	{k:'子宫内膜', v:'E'},
	{k:'子宫', v:'F'},
	{k:'子宫韧带', v:'G'},
	{k:'阴道壁', v:'H'},
	{k:'阴道', v:'J'},
	{k:'前庭大腺', v:'K'},
	{k:'阴蒂', v:'L'},
	{k:'大阴唇', v:'N'},
	{k:'小阴唇', v:'P'},
	{k:'处女膜', v:'Q'},
	{k:'外阴', v:'R'},
	{k:'会阴', v:'S'},
	{k:'其它不可分女性生殖系统', v:'Z'},
];

export const UBodyOpts = [
	{k:'孕产期子宫', v:'A'},
	{k:'孕产期宫颈', v:'B'},
	{k:'孕妇产前功能', v:'C'},
	{k:'产妇产程及产后功能', v:'D'},
	{k:'卵子', v:'E'},
	{k:'胚胎', v:'F'},
	{k:'胎儿', v:'G'},
	{k:'胚胎及胎儿功能', v:'H'},
	{k:'羊膜', v:'J'},
	{k:'胎盘', v:'K'},
	{k:'脐带', v:'L'},
	{k:'胚胎其它相关产物', v:'M'},
	{k:'其它不可分孕产操作', v:'Z'},
];

export const VBodyOpts = [
	{k:'颅骨', v:'A'},
	{k:'颈椎骨', v:'B'},
	{k:'颈椎间盘', v:'C'},
	{k:'颈胸椎', v:'D'},
	{k:'胸椎骨', v:'E'},
	{k:'胸椎间盘', v:'F'},
	{k:'胸腰椎', v:'G'},
	{k:'腰椎骨', v:'H'},
	{k:'腰椎间盘', v:'J'},
	{k:'腰骶椎', v:'K'},
	{k:'骶', v:'L'},
	{k:'脊柱', v:'M'},
	{k:'尾骨', v:'N'},
	{k:'脊周肌肉及软组织', v:'S'},
	{k:'胸廓', v:'T'},
	{k:'肋骨及肋软骨', v:'U'},
	{k:'胸部肌肉及软组织', v:'V'},
	{k:'其它', v:'Z'},
];

export const WBodyOpts = [
	{k:'锁骨', v:'A'},
	{k:'肩胛骨', v:'B'},
	{k:'肩关节', v:'C'},
	{k:'肩袖', v:'D'},
	{k:'肱骨近端', v:'E'},
	{k:'肱骨干', v:'F'},
	{k:'肱骨远端', v:'G'},
	{k:'肘关节', v:'H'},
	{k:'尺骨', v:'J'},
	{k:'尺骨干', v:'K'},
	{k:'尺骨远端', v:'L'},
	{k:'桡骨', v:'M'},
	{k:'桡骨干', v:'N'},
	{k:'桡骨远端', v:'P'},
	{k:'腕骨', v:'Q'},
	{k:'掌指骨', v:'R'},
	{k:'桡腕关节', v:'S'},
	{k:'腕骨间关节', v:'T'},
	{k:'掌骨、指骨关节', v:'U'},
	{k:'拇指', v:'V'},
	{k:'指骨及关节', v:'W'},
	{k:'手部骨及关节', v:'X'},
	{k:'上肢骨及关节', v:'Y'},
	{k:'上肢肌肉及软组织', v:'Z'},
];

export const XBodyOpts = [
	{k:'骨盆', v:'A'},
	{k:'髋关节', v:'B'},
	{k:'下肢', v:'C'},
	{k:'股骨近端', v:'D'},
	{k:'股骨干', v:'E'},
	{k:'股骨远端', v:'F'},
	{k:'膝关节', v:'G'},
	{k:'髌骨', v:'H'},
	{k:'膝关节韧带', v:'J'},
	{k:'膝半月板', v:'K'},
	{k:'胫骨', v:'L'},
	{k:'腓骨', v:'M'},
	{k:'踝关节', v:'N'},
	{k:'跟腱', v:'P'},
	{k:'跗骨', v:'Q'},
	{k:'跖、趾骨', v:'R'},
	{k:'踇', v:'S'},
	{k:'趾', v:'T'},
	{k:'足', v:'U'},
	{k:'下肢其它', v:'V'},
	{k:'骨', v:'W'},
	{k:'四肢关节', v:'X'},
	{k:'其它不可分肌肉及软组织', v:'Y'},
	{k:'其它不可分肌肉骨骼系统', v:'Z'},
];

export const YBodyOpts = [
	{k:'乳房', v:'A'},
	{k:'乳头', v:'B'},
	{k:'头部皮肤及皮下', v:'C'},
	{k:'面部皮肤及皮下', v:'D'},
	{k:'颈部皮肤及皮下', v:'E'},
	{k:'胸部皮肤及皮下', v:'F'},
	{k:'腹部皮肤及皮下', v:'G'},
	{k:'臀部会阴部皮肤及皮下', v:'H'},
	{k:'上肢皮肤及皮下', v:'J'},
	{k:'手部皮肤及皮下', v:'K'},
	{k:'下肢皮肤及皮下', v:'L'},
	{k:'足部皮肤及皮下', v:'M'},
	{k:'四肢皮肤及皮下', v:'N'},
	{k:'全身皮肤及皮下', v:'P'},
	{k:'毛发', v:'Q'},
	{k:'指(趾)甲', v:'R'},
	{k:'皮脂腺和汗腺', v:'S'},
	{k:'带蒂皮瓣', v:'T'},
	{k:'皮瓣', v:'U'},
	{k:'组织瓣', v:'V'},
	{k:'皮片', v:'W'},
	{k:'四肢关节', v:'X'},
	{k:'局部皮肤及皮下', v:'Y'},
	{k:'其它', v:'Z'},
];

export const ZBodyOpts = [
	{k:'头部', v:'A'},
	{k:'颈部', v:'B'},
	{k:'头颈部', v:'C'},
	{k:'胸部', v:'D'},
	{k:'腹部', v:'E'},
	{k:'盆部及会阴部', v:'F'},
	{k:'背腰部', v:'G'},
	{k:'躯干', v:'H'},
	{k:'上臂', v:'J'},
	{k:'前臂', v:'K'},
	{k:'手', v:'L'},
	{k:'上肢', v:'M'},
	{k:'大腿', v:'N'},
	{k:'小腿', v:'P'},
	{k:'足', v:'Q'},
	{k:'下肢', v:'R'},
	{k:'肢体', v:'S'},
	{k:'四肢', v:'T'},
	{k:'未特指单脏器', v:'V'},
	{k:'身体局部', v:'X'},
	{k:'全身', v:'Y'},
	{k:'无法定位', v:'Z'},
];

export const BodySystemOpts = [
	{k:'麻醉', v:'A', nextOpts: ABodyOpts},
	{k:'中枢神经系统', v:'B', nextOpts: BBodyOpts},
	{k:'周围神经系统', v:'C', nextOpts: CBodyOpts},
	{k:'内分泌系统', v:'D', nextOpts: DBodyOpts},
	{k:'眼', v:'E', nextOpts: EBodyOpts},
	{k:'耳', v:'F', nextOpts: FBodyOpts},
	{k:'鼻咽喉', v:'G', nextOpts: GBodyOpts},
	{k:'口腔颌面', v:'H', nextOpts: HBodyOpts},
	{k:'呼吸系统', v:'J', nextOpts: JBodyOpts},
	{k:'循环系统-心脏及心包', v:'K', nextOpts: KBodyOpts},
	{k:'循环系统-动脉', v:'L', nextOpts: LBodyOpts},
	{k:'循环系统-静脉', v:'M', nextOpts: MBodyOpts},
	{k:'造血及淋巴系统', v:'N', nextOpts: NBodyOpts},
	{k:'消化系统-消化管腔', v:'P', nextOpts: PBodyOpts},
	{k:'消化系统-消化脏器', v:'Q', nextOpts: QBodyOpts},
	{k:'泌尿系统', v:'R', nextOpts: RBodyOpts},
	{k:'男性生殖系统', v:'S', nextOpts: SBodyOpts},
	{k:'女性生殖系统', v:'T', nextOpts: TBodyOpts},
	{k:'孕产操作', v:'U', nextOpts: UBodyOpts},
	{k:'肌肉骨骼系统-中轴骨及连接', v:'V', nextOpts: VBodyOpts},
	{k:'肌肉骨骼系统-上肢骨及连接', v:'W', nextOpts: WBodyOpts},
	{k:'肌肉骨骼系统-下肢骨及连接', v:'X', nextOpts: XBodyOpts},
	{k:'体被系统', v:'Y', nextOpts: YBodyOpts},
	{k:'局部大体部位', v:'Z', nextOpts: ZBodyOpts},
];

export const FBasicOps = [
	{k:'检查评估', v:'01'},
	{k:'测量', v:'02'},
	{k:'试验', v:'03'},
	{k:'量表评估', v:'04'},
	{k:'活检', v:'05'},
	{k:'造影', v:'06'},
	{k:'探查', v:'07'},
	{k:'样本采集', v:'08'},
	{k:'监测', v:'09'},
];

export const InPathOpts = [
	{k:'经皮(非血管穿刺)', v:'1'},
	{k:'经管腔', v:'2'},
	{k:'直视', v:'3'},
	{k:'经内镜', v:'4'},
	{k:'经皮(经血管穿刺)', v:'5'},
	{k:'体外', v:'6'},
	{k:'联合入路', v:'8'},
	{k:'其他不可分入路', v:'9'},
];