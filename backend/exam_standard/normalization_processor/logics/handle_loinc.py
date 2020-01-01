import traceback
from db_models.db_models import LoincObjMapping, Loinc
from sqlalchemy import and_


def pre_map(db, raw_obj_list, loinc_obj_map):
    """
    功能函数 的 子功能函数 -- 用预映射字典 loinc_obj_map 将 raw_obj_list 中的每个obj规范化 (主函数中被调用)
    如: 将raw_obj"肝" 规范为 processed_obj"肝脏"
    以下是旧的 loinc_obj_map 结构，(由于层太深，查找太慢，之后会修改为下面的优化版本)
    loinc_obj_map = {'放射医学检查': [{'raw': '肝', 'standard': '肝脏'},
                                    {'raw': '肾', 'standard': '肾脏'},
                                    {'raw': '肾小盏', 'standard': '肾盏'},
                                    {'raw': '腹腔内', 'standard': '腹腔'},
                                    {'raw': '双肺', 'standard': '肺.双侧'},
                                    {'raw': '肾小管', 'standard': '尿液'}]}

    2019-11-25 周一 更新后的 loinc_obj_map 结构:
    loinc_obj_map = {
        "<raw_value>": "<standard_value>",
        "肝": "肝脏",
        "肾小盏": "肾盏",
        "双肺": "肺.双侧",
        ...
    }
    """
    # 2019-12-23 json 文件过滤
    # res = []
    # for raw_obj in raw_obj_list:
    #     # 如果能做预映射，就做；如果map中没有这个obj，就直接返回原始的raw_obj
    #     standard_obj = loinc_obj_map[raw_obj] if raw_obj in loinc_obj_map.keys() else raw_obj
    #     # 放入res
    #     res.append(standard_obj)

    # db 数据库过滤
    res = []
    try:
        for raw_obj in raw_obj_list:
            record = db.session.query(LoincObjMapping.dst).filter(LoincObjMapping.src == raw_obj).first()
            if record is not None:
                res.append(record[0])
            else:
                res.append(raw_obj)
    except Exception as e:
        print("loinc obj map error: %s" % traceback.format_exc())

    return res


def init_loinc_system_stat_dict(loinc_system):
    """
    功能函数 2 的 子功能函数 - 将 loinc_system 字符串，处理为结构化数据格式
    在 stat_loinc_systems_step_2 中被调用
    依据: loinc_tree 中已有的 + & ^ > 等标志符

    流程:
    1 输入 loinc_system = "颈部>脊椎.颈段 & 胸部>脊椎.胸段 & 腹部>脊椎.腰段 & 盆腔>骶骨+尾骨"
    2 调用 _split, char="&" --> 处理后 loinc_system = ['颈部>脊椎.颈段', '胸部>脊椎.胸段', '腹部>脊椎.腰段', '盆腔>骶骨+尾骨']
    3 对处理后的 loinc_system 列表中的每一项 s, 做以下处理:
        # 默认1: left 是高级部位, right 是低级的子部位;
        # 默认2: left 有可能是虚拟的 virtual. "virtual" 是人为定义的虚拟部位，在没有">"符号时使用.
        **默认 2 的作用: 为了保证 3.1 的 a/b 两种情况，都可以用后面的统一处理方式(因为数据格式统一，都有left和right字段):
            <1> 3.2中, 是统一将 res[left]初始化为[]的, 如果没有"virtual", 会有KeyError
            <2> 3.3中, 是统一对 right 调用 _split 的

        3.1 s = "盆腔>骶骨+尾骨" 或者 s = "腹部"
        3.1 尝试调用 _split, char=">", 有2种可能:
            a. 若s中包含 ">" --> 那么 s = ["盆腔", "骶骨+尾骨"] --> left = "盆腔", right = "骶骨+尾骨"
            b. 若s中没有 ">" --> 那么 s = ["腹部"] --> left = "virtual", right = "腹部"
        3.2 初始化 res[left] = [], 即:
            对于3.1-a: res["盆腔"] = []
            对于3.1-b: res["virtual"] = []
        3.3 对 right 调用_split, char="+"
            对于 right = "骶骨+尾骨" --> 结果是 ["骶骨", "尾骨"]
            对于 right = "腹部" --> 结果是 ["腹部"]
        3.4 对每一个right中 split出的结果，初始化统计
            right = "骶骨+尾骨" --> 统计结果是 [["骶骨", 0], ["尾骨", 0]]
            right = "腹部" --> 统计结果是 [["腹部", 0]]
        3.4 将right的结果写入left
            若 left = "盆腔" --> res["盆腔"] = [["骶骨", 0], ["尾骨", 0]]
            若 left = "virtual" --> res["virtual"] = [["腹部", 0]]

    以上基本流程结束

    示例:
    输入: loinc_system = {"class": "放射医学检查",
                         "system": "颈部>脊椎.颈段 & 胸部>脊椎.胸段 & 腹部>脊椎.腰段 & 盆腔>骶骨+尾骨"}
    输出: res = {'颈部': [['脊椎.颈段': 0]],
                '胸部': [['脊椎.胸段': 0]],
                '腹部': [['脊椎.腰段': 0]],
                '盆腔': [['骶骨': 0], ['尾骨': 0]]}
    """

    def _split(raw_string, char):
        """
        示例1:
        raw_string = "颈部>脊椎.颈段 & 胸部>脊椎.胸段 & 腹部>脊椎.腰段 & 盆腔>骶骨+尾骨"
        char = "&"
        res = ['颈部>脊椎.颈段', '胸部>脊椎.胸段', '腹部>脊椎.腰段', '盆腔>骶骨+尾骨']

        示例2:
        raw_string = "颈部>脊椎.颈段"
        char = ">"
        res = ["颈部", "脊椎.颈段"]
        """
        return list(map(lambda i: i.rstrip().lstrip(), raw_string.split(char)))

    res = {}
    # 处理后, loinc_system = ['颈部>脊椎.颈段', '胸部>脊椎.胸段', '腹部>脊椎.腰段', '盆腔>骶骨+尾骨']
    loinc_system = _split(loinc_system, char="&")

    # s = "盆腔>骶骨+尾骨"
    # 注意: left 是高级, right是低级
    for s in loinc_system:
        # s = ["盆腔", "骶骨+尾骨"], left = "盆腔", right = "骶骨+尾骨"
        s = _split(s, char=">")
        if len(s) == 1:
            left = "virtual"
            right = s[0]
        else:
            left, right = s[0], s[1]
        res[left] = []
        # right = ["骶骨", "尾骨"]
        right = _split(right, char="+")
        res[left] = [[r, 0] for r in right]
    return res


def filter_loinc_systems_step_0(db, standard_data, loinc_tree, loinc_norm_map_step_0):
    """
    功能函数 0 - 主函数中被调用, 先根据 standard_data 中的"exam_class"字段, 从 loinc_norm_map_step_0 中映射
    loinc_norm_map_step_0 = {
        "<原数据传入的 exam_class 的值>" : [<Loinc super_class值>, <Loinc class值>, <Loinc system值>],
        ...
    }

    注: 由于 step0的数据结构还未确定, 这里的db操作待定, 先用map字典过渡.
    """

    loinc_res = []
    # exam_class = standard_data["exam_class"]
    # # 若有, 则返回匹配到的loinc结果，若无, 则返回None
    # mapped_res = loinc_norm_map_step_0[exam_class] if exam_class in loinc_norm_map_step_0.keys() else None
    #
    # if mapped_res:
    #     loinc_num = get_loinc_num(db, loinc_tree, mapped_res)
    #     loinc_res.append(
    #             {"super_class": mapped_res["super_class"],
    #              "class": mapped_res["class"],
    #              "system": mapped_res["system"],
    #              "num": loinc_num}
    #         )

    return loinc_res


def filter_loinc_systems_step_1(db, loinc_tree, obj_list):
    """
    功能函数 1 - 主函数中被调用, 如果step0 没结果，再使用该函数, 过滤出所有可能的 loinc_systems_step_1
    loinc_tree: 即 loinc_tree.json 源文件全部数据
    输入:
    loinc_tree = {"SC$放射医学检查": {"放射医学检查": {"腹部>肝脏": [{Loinc_1}, {Loinc_2}, ...]}},
                  "SC$产科学检查": {"产科学检查": {"肝脏^胎儿": [{Loinc_1}, {Loinc_2}, ...]}}
                }

    obj_list = ["肝脏", "肝内", "胆管", "胆囊"]

    输出:
    <1> json文件输出版本
    res = [
            {'super_class': 'SC$放射医学检查', 'class': '放射医学检查', 'system': '头部+颈部>脑池类'}
            {'super_class': 'SC$产科学检查与测量指标', 'class': '产科学检查与测量指标.超声', 'system': '小脑^胎儿'}
    ]
    <2> db输出版本
    res = [
            {'super_class': 'SC$产科学检查与测量指标.超声', 'class': '产科学检查与测量指标.超声', 'system': '小脑^胎儿'}
            {'super_class': 'SC$放射医学检查', 'class': '放射医学检查', 'system': '头部+颈部>脑池类'}
    ]
    """
    # 2019-12-23 json 文件过滤
    # res = []
    # for obj in obj_list:
    #     # sc_k = "SC$放射医学检查", sc_v = 这个SC下的所有数据(即所有的 class + system)
    #     for sc_k, sc_v in loinc_tree.items():
    #         # k="放射医学检查", v = 这个class下的所有数据 (即所有的 system)
    #         for k, v in sc_v.items():
    #             # i = "腹部>肝脏", 即每一个system
    #             for i in v.keys():
    #                 # 只有以下2个条件满足，才将这个 i(也就是可能会归一到的 system)放入res中:
    #                 # <1> 当前的obj(比如"肝脏"), 包含在当前的i(即一个system: "腹部>肝脏")中
    #                 if obj not in i:
    #                     continue
    #                 # <2> 当前i不在res中 (这个条件主要是是为了避免重复放入，为了去重.)
    #                 if i not in [r["system"] for r in res]:
    #                     # 注意, 同时放入super_class 和 class, 是为了保证有一个完整路径，可以追溯
    #                     res.append(
    #                         {"super_class": sc_k, "class": k, "system": i}
    #                     )

    # db 过滤
    res = []
    query = {}
    try:
        # 先对每一个obj做一次搜索 (搜索条件: system 字段包括该 obj)
        for obj in obj_list:
            query[obj] = db.session.query(Loinc).filter(Loinc.system.contains(obj))

        # 将所有obj的搜索结果字典，处理后写入 res
        for k, v in query.items():
            if v is not None:
                for i in v.all():
                    tmp = {"super_class": "SC$%s" % i.class_x,
                           "class": i.class_x,
                           "system": i.system}
                    if tmp not in res:
                        res.append(tmp)

    except Exception as e:
        print("loinc step 1 error: %s" % traceback.format_exc())
    return res


def stat_loinc_systems_step_2(loinc_systems_step_1, obj_list):
    """
    功能函数 2 - 主函数中被调用, 根据 obj_list, 调用 init_loinc_system_stat_dict 函数，对每个system进行统计

    流程:
    1 根据 step1 函数的返回结果, 对结果中的每一个system:
        1.1 调用 init_loinc_system_stat_dict 函数, 返回一个初始化好的统计结果字典.
        ## 注意，这里只是初始化，并未做实质统计，现在的 stat_dict 全都是0
        1.2 调用 _update 函数, 根据 obj_list, 更新这个初始化好的 stat_dict
        1.3 更新完成，将 _update 函数返回的 stat_dict, 赋值给当前 system["stat"]
        1.4 将system 写入 res

    示例:
    res = [
        {'super_class': 'SC$体温', 'class': '体温.分子型', 'system': '膀胱', 'stat': {'virtual': [['膀胱', 1]]}},
        {...},
        ...
    ]
    """

    def _update(stat_dict, obj_list):
        """
        因为init_loinc_system_stat_dict这个函数，只是init, 也就是把统计字典的结构初始化好，并不会实际做统计
        实际的统计(也就是update), 是当前这个内置的 _update 函数，根据obj_list来做的.

        输入参数：
        stat_dict: init_loinc_system_stat_dict 函数返回的初始化好的统计结果(全都是0)
        obj_list: ["肝脏", "肝内", "胆管", "胆囊"]

        :return: 更新后的 stat_dict 统计结果
        """
        for obj in obj_list:
            for k, v in stat_dict.items():
                for item in v:
                    if obj in item[0]:
                        item[1] += 1
                        break
        return stat_dict

    res = []

    for system in loinc_systems_step_1:
        # 1 初始化
        stat_dict = init_loinc_system_stat_dict(system["system"])
        # 2 根据obj_list, 做统计
        system["stat"] = _update(stat_dict, obj_list)
        res.append(system)

    return res


def filter_loinc_systems_step_3(loinc_systems_step_2, obj_list, text):
    """
    功能函数 3 - 主函数中被调用, 进一步过滤
    目前逻辑: 看总数量 --> 若总数相同 --> 看obj覆盖度(include_obj_num)

    举例:
    比如有2个可能system, 分别是:
    sys1 = "腹部>肝脏+胰腺"
    sys2 = "腹部>肝脏+胆囊+胆总管"

    参考以下不同情况的obj_list:
    case1 - obj_list = ["肝脏", "胆囊"]:
        <1> 判断数量
            sys1 总数量 = 1 (肝脏)
            sys2 总数量 = 1 + 1 = 2 (肝脏, 胆囊 各1次)
        <2> 由于数量 sys1 < sys2 --> 不需要做覆盖度判断 --> 选 sys2

    case2 - obj_list = ["胆囊", "胆总管", "胰腺", "胰腺"]
        <1> 判断数量
            sys1 总数量 = 2 (胰腺2次)
            sys2 总数量 = 2 (胆囊1次 + 胆总管1次)
        <2> 数量 sys1 == sys2 --> 需要做覆盖度判断
            sys1 覆盖度 = 1 (只有胰腺)
            sys2 覆盖度 = 2 (胆囊 + 胆总管)
        <3> 由于覆盖度 sys1 < sys2 --> 选 sys2


    2019-11-05 注释
    示例:
    输入 loinc_systems_step_2 = [
        {'super_class': "SC$放射医学检查", 'class': '放射医学检查', 'system': '腹部>肝内门脉系统', 'stat': {'腹部': [['肝内门脉系统', 1]]}}
        {'super_class': "SC$产科学检查与测量指标", 'class': '产科学检查与测量指标.超声', 'system': '肝脏', 'stat': {'virtual': [['肝脏', 1]]}}
        {'super_class': "SC$化学实验类", 'class': '化学试验类', 'system': '肝脏', 'stat': {'virtual': [['肝脏', 1]]}}
        {'super_class': "SC$微生物学试验类", 'class': '微生物学试验类', 'system': '肝脏', 'stat': {'virtual': [['肝脏', 1]]}}
        {'super_class': "SC$放射医学检查", 'class': '放射医学检查', 'system': '肝脏', 'stat': {'virtual': [['肝脏', 1]]}}
        {'super_class': "SC$放射医学检查", 'class': '放射医学检查', 'system': '胸部>肺 & 腹部>肝脏', 'stat': {'胸部': [['肺', 0]], '腹部': [['肝脏', 1]]}}
        {'super_class': "SC$放射医学检查", 'class': '放射医学检查', 'system': '胸部>膈肌 & 腹部>肝脏', 'stat': {'胸部': [['膈肌', 0]], '腹部': [['肝脏', 1]]}}
        {'super_class': "SC$放射医学检查", 'class': '放射医学检查', 'system': '腹部>肝脏+胆管类+胆囊', 'stat': {'腹部': [['肝脏', 1], ['胆管类', 0], ['胆囊', 1]]}}
        {'super_class': "SC$放射医学检查", 'class': '放射医学检查', 'system': '腹部>肝脏', 'stat': {'腹部': [['肝脏', 1]]}}
        {'super_class': "SC$放射医学检查", 'class': '放射医学检查', 'system': '腹部>肝脏+胆管类+胰', 'stat': {'腹部': [['肝脏', 1], ['胆管类', 0], ['胰', 0]]}}
        {'super_class': "SC$病理学", 'class': '病理学', 'system': '肝脏', 'stat': {'virtual': [['肝脏', 1]]}}
        ...
      ]

    # 注意: 因为有可能2个system的总数量和覆盖度都相同，所以res不一定只有一个，可能有多个
    res = [{"super_class": "SC$放射医学检查", "class": "放射医学检查", "system": "腹部>肝脏+胆管类+胆囊", "count": 2},
           {...}
          ]
    """
    # only_radiation  - 如果列表中有"放射医学检查"项，则优先归到放射检查项中
    only_radiation = [i for i in loinc_systems_step_2 if i["class"] == "放射医学检查"]
    loinc_systems_step_2 = only_radiation if len(only_radiation) > 0 else loinc_systems_step_2

    # two factor: 即指判断的2个依据: 1是obj的总数量; 2是不同的obj的覆盖度(包含不同种类的obj的数量)
    two_factor_count_list = []

    # 统计 hit_count 和 include_obj 的最大值
    for i in loinc_systems_step_2:
        i_count, i_include_obj_num = 0, 0
        for k, v in i["stat"].items():
            # 计算总数量
            i_count += sum([j[1] for j in v])
            # 计算覆盖度
            for j in v:
                if j[1] > 0:
                    i_include_obj_num += 1

        two_factor_count_list.append(
            {"super_class": i["super_class"],
             "class": i["class"],
             "system": i["system"],
             "count": i_count,
             "include_obj_num": i_include_obj_num}
        )

    # try-except为了捕获 two_factor_count_list 为空的异常情况
    res = []
    try:
        max_hit_count = max(cnt["count"] for cnt in two_factor_count_list)
        max_include_obj = max(num["include_obj_num"] for num in two_factor_count_list)

        # <1> 用 count 最大值过滤
        res = [r for r in two_factor_count_list if r["count"] == max_hit_count]

        # <2> 如果有多个system的 max_count一样，再用 include_obj 最大值过滤
        if len(res) > 1:
            res = [r for r in two_factor_count_list if r["include_obj_num"] == max_include_obj]

    except ValueError as e:
        # 如果这里报错, 那就是一个obj_list中存在的所有obj, 没有一个能归一到LOINC结果中.
        # 所以, 可能是obj写法比较随意，需要用 loinc_obj_map 做一下预映射，将其规范化.
        if len(two_factor_count_list) == 0:
            if len(obj_list) == 0:
                print("obj_list为空")
            else:
                print("该obj_list无法归一到任何loinc结果中，需要使用预映射规范化:\n%s" % obj_list)
    return res


def filter_loinc_systems_step_4(db, loinc_tree, loinc_systems_step_3):
    """
    功能函数 4 - 从 step3 中选择唯一的 LOINC system
    输入 (step3的结果, 有可能是1个，也有可能是多个):
    [{'super_class': 'SC$放射医学检查', 'class': '放射医学检查', 'system': '胸部>食管', 'count': 1, 'include_obj_num': 1},
    {'super_class': 'SC$放射医学检查', 'class': '放射医学检查', 'system': '胸部>食管 & 腹部>胃', 'count': 1, 'include_obj_num': 1},
    {'super_class': 'SC$放射医学检查', 'class': '放射医学检查', 'system': '颈部>下咽部 & 胸部>食管', 'count': 1, 'include_obj_num': 1},
    {'super_class': 'SC$放射医学检查', 'class': '放射医学检查', 'system': '颈部>咽部+食管.颈段', 'count': 1, 'include_obj_num': 1},
    {'super_class': 'SC$放射医学检查', 'class': '放射医学检查', 'system': '腹部>胃十二指肠动脉', 'count': 1, 'include_obj_num': 1},
    {'super_class': 'SC$放射医学检查', 'class': '放射医学检查', 'system': '腹部>幽门', 'count': 1, 'include_obj_num': 1}]
    
    流程:
    1 从输入中优先挑 "放射医学检查"
        1.1 有 --> 选择, 并结束循环
        1.2 无 --> 那么选择输入中的第一项作为结果, 结束循环
    2 步骤1可以获取唯一的system, 但是唯一的 system 可能包含多个 loinc_num
    3 从 loinc_tree 中获取这个唯一的system结果所对应的所有 loinc_num_list 列表中的第一项，作为默认的取值规则
    4 做两件事:
        4.1 删除不用的k-v对， 比如之前统计用的count 和 include_obj_num 字段
        4.2 将loinc_num 加入结果
    5 返回
    
    参数:
    i: 输入数据中的每一项
    i = {'super_class': 'SC$放射医学检查', 'class': '放射医学检查', 'system': '胸部>食管', 'count': 1, 'include_obj_num': 1}

    注意: 由于obj_list 可能从 loinc tree 中过滤不出任何结果，所以要考虑传入的参数 loinc_systems_step_3 是空值的情况
    
    输出:
    res = {"super_class": "xxx", "class": "xxx", "system": "xxx"}
    """

    res_one = {}
    if len(loinc_systems_step_3) == 0:
        return res_one

    # 1 先尝试将 "放射医学检查" 的结果优先选出来.
    for i in loinc_systems_step_3:
        # 1.1 有 --> 放入, 并且结束循环
        if i["class"] == "放射医学检查":
            res_one = i
            break

    # 1.2 若没有"放射医学检查" --> 再从所有结果中选一个作为最终结果 (默认选step 3结果的第一个)
    if res_one == {}:
        res_one = loinc_systems_step_3[0]

    # 2 删无用值
    res_one.pop("count")
    res_one.pop("include_obj_num")

    # 3 json 过滤 (2019-12-24注释)
    # # 2 and 3: 从system的多个loinc_num 中, 取唯一的loinc_num
    # sc = res_one["super_class"]
    # cls = res_one["class"]
    # sys = res_one["system"]
    # the_unique_loinc_num = loinc_tree[sc][cls][sys][0]["LOINC_NUM"]

    # 3 db 过滤
    record = db.session.query(Loinc.loinc_number) \
        .filter(and_(Loinc.class_x == res_one["class"], Loinc.system == res_one["system"])) \
        .first()

    the_unique_loinc_num = record[0] if record else ""

    # 4添加 loinc 值
    res_one["num"] = the_unique_loinc_num

    return res_one


def get_loinc_num(db, loinc_tree, system_one):
    """
    功能函数 5 - 根据loinc_tree, 从 step 4 结果中拿出 loinc_num
    注意: step4 返回的虽然是唯一的system, 但是, 1个 system 下可能有很多 loinc_num
    所以, 这个函数要和 step4 函数区分开

    输入:
    system_one: step4 函数返回的唯一 loinc_system (其中可能包括很多 loinc_num)

    输出:
    唯一的 loinc_num_one
    """

    # 2019-12-24 loinc tree json 过滤
    # # 1 拿到system下所有的 loinc_num
    # sc = system_one["super_class"]
    # cls = system_one["class"]
    # sys = system_one["system"]
    # loinc_num_list = loinc_tree[sc][cls][sys]
    #
    # # 2 直接取第一个
    # loinc_num_one = loinc_num_list[0]["LOINC_NUM"]

    # db 过滤
    record = db.session.query(Loinc.loinc_number) \
        .filter(and_(Loinc.class_x == system_one["class"], Loinc.system == system_one["system"])) \
        .first()

    loinc_num_one = record[0] if record else ""

    return loinc_num_one


def handle_loinc(db, standard_data, loinc_tree, loinc_obj_map, loinc_norm_map_step_0):
    """
    主函数 - 处理 loinc 归一
    [参数]:
    standard_data: ExamStandardProcessor 结构化出的结果, {"id": xxx, "text": xxx, "res": [很多条结构化结果]}
    raw_obj_list: 一个检查报告文本中, 人工标注出的所有的 symptom_obj 的集合, 用来过滤loinc_tree 中对应的 system。
    loinc_obj_map: 手动定义的预映射字典, 用来将检查报告文本中不规范的一些obj写法（如"肝"), 统一规范为loinc支持搜索的写法（如"肝脏"）
    obj_list: 通过预映射字典规范后的 obj_list

    [流程]:
    1 先人为地从 loinc_norm_map_step_0.json 中匹配, 若匹配不到, 再按一下流程，通过obj_list 过滤
    2 通过 standard_data > 获取 raw_obj_list
    3 通过 loinc_obj_map > 获取 obj_list
    4 通过 obj_list > 从loinc_tree 中获得所有可能相关的 loinc_systems_step_1
    5 通过step_1 > 获取 step_2
    6 通过 step_2 > 获取 step_3

    [示例数据]
    loinc_tree["SC$放射医学检查"]["放射医学检查"].keys() = [
                                                        '胸部>肺.右侧', '胸部>肺.左侧', '胸部>肺动脉.双侧',
                                                        '胸部>肺动脉.右侧', '胸部>肺动脉.左侧', '胸部>肺动脉类',
                                                        "腹部>肝+胆管", ...,
                                                        ...
                                                        ]
    输出:
    loinc_res = [{'super_class': 'SC$放射医学检查',
                 'class': '放射医学检查',
                 'system': '腹部>肝脏+胆管类+胆囊',
                 'num': '43557-8'}
                ]
    """

    # 1 先根据standard_data中的唯一id, 人为从map中匹配
    loinc_res = filter_loinc_systems_step_0(db, standard_data, loinc_tree, loinc_norm_map_step_0)
    # 若能匹配到, 直接return，不再进行下面的filter step 函数
    if len(loinc_res) > 0:
        return loinc_res

    # 如果匹配不到, 再按以下2-6流程过滤
    loinc_res = []
    # 2 根据 tag_list > 获取 raw_obj_list > 预映射, 规范化处理为 obj_list
    raw_obj_list = list(set([i[3] for i in standard_data["target"] if i[2] in ["symptom_obj", "lesion"]]))
    obj_list = pre_map(db, raw_obj_list, loinc_obj_map)

    # 3 通过 obj_list > 获取 loinc_tree 中所有可能的 step_1 结果
    loinc_systems_step_1 = filter_loinc_systems_step_1(db, loinc_tree, obj_list)

    # 4 根据 step_1 > 进一步统计 > 得到有统计结果的 step_2 (这一步没有过滤，只有统计)
    loinc_systems_step_2 = stat_loinc_systems_step_2(loinc_systems_step_1, obj_list)

    # 5 根据 step2 > 过滤出最终的loinc system step 3（过滤依据: 暂定为 obj总数量 + obj覆盖度)
    loinc_systems_step_3 = filter_loinc_systems_step_3(loinc_systems_step_2, obj_list, standard_data["text"])

    # 6 目前选其中一个 (并且以 放射医学检查 作为优先项，有则先选), 数据格式是字典形式 (之前是元组，已更新为字典)
    res_one = filter_loinc_systems_step_4(db, loinc_tree, loinc_systems_step_3)

    if res_one:
        loinc_res.append(res_one)
    return loinc_res
