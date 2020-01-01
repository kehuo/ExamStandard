from exam_standard.exam_standard_processor.utils import connect
from exam_standard.exam_standard_processor.logic.bu_build_work_flow import build_work_flow


def get_symptom_desc_idx_from_text(seg, text, i, stack):
    """
    功能函数1 -- 找到当前deco的前一个desc，和下一个desc
    同时, 如果找到了左边(也就是pre_desc) --> 将其值赋值给 stack["special_pre_desc"]

    注意: stack["special_pre_desc"]的用处:
    如果和前一项之间没有标点，那么属于特殊情况 -- 当前deco要和前一项拼接，并且吐结果，所以要用stack记录前一项desc的值.
    因为如果不用stack["special_pre_desc"]的话, desc遇到自己就拼完，然后把自己清空了.

    示例:
    text = "腹部立位平片示：腹部肠管内少量积气，以左上腹部结肠内稍多，未见明显扩张及液气平面，双膈下未见游离气体。"
    seg[i] = [18, 27, 'symptom_deco', '以左上腹部结肠内稍多']
    那么：
    前一个desc就是 "积气", pre_symptom_desc_idx_in_text 等于 "积气" 在text中的索引，就是 16.
    同时, stack["special_pre_desc"] = "#18$27&symptom_desc@积气^"

    后一个desc就是 "扩张", next_symptom_desc_idx_in_text 等于 "扩张" 在text中的索引，就是 33.

    """

    pre_symptom_desc_idx_in_text = None
    for seg_idx in range(i-1, -1, -1):
        if seg[seg_idx][2] == "symptom_desc":
            stack["special_pre_desc"] = [connect(seg[seg_idx])]
            pre_symptom_desc_idx_in_text = seg[seg_idx][1]
            break

    # next_symptom_desc_idx_in_text = len(text) - 1
    next_symptom_desc_idx_in_text = None
    for seg_idx in range(i, len(seg)):
        if seg[seg_idx][2] == "symptom_desc":
            next_symptom_desc_idx_in_text = seg[seg_idx][0]
            break

    return pre_symptom_desc_idx_in_text, next_symptom_desc_idx_in_text


def has_comma_between_me_and_desc(desc_type, seg, text, i, desc_idx_in_text, stack):
    """
    功能函数2 -- 检查当前deco和某个desc之间， 在原文本text中是否有标点符号
    :param desc_type: "previous_desc" or "next_desc"
    :param desc_idx_in_text: find_previous_and_next_symptom_desc 函数返回的结果
    示例:
    原文 = "腹部立位平片示：腹部肠管内少量积气，以左上腹部结肠内稍多，未见明显扩张及液气平面，双膈下未见游离气体。"
    当前deco = "以左上腹部结肠内稍多"
    desc_type = previous_desc, 那么返回 "积气"和"以上腹部结肠内稍多" 之间是否有标点符号（有，所以返回True）
    desc_type = next_desc, 那么返回 "以上腹部结肠内稍多" 和"扩张" 之间是否有标点（有，所以返回True）

    :return: 是否有标点

    """

    has_comma = False
    comma_list = ["，", "。", "；"]

    if desc_type == "previous_desc":
        sub_text = text[desc_idx_in_text:seg[i][0]]
        for comma in comma_list:
            if comma in sub_text:
                has_comma = True
                # 如果和前一项desc之间有逗号, 那不是特殊情况，这个stack也可以清空了，不需要了
                stack["special_pre_desc"] = []
                break

    elif desc_type == "next_desc":
        sub_text = text[seg[i][1]:desc_idx_in_text]
        for comma in comma_list:
            if comma in sub_text:
                has_comma = True
                break

    return has_comma


def same_desc_build_twice(res_seg, desc_tag):
    """
    功能函数3 -- 该函数用来在遇到特殊deco, 并且成功拼出一个结果时, 判断: 是否需要把res_seg中重复拼了多次的desc, 删掉一个.

    desc_tag = ["#0$1&symptom_desc^病变"] 或者一个空列表 []
    curr_res = "#0$2&symptom_obj*肾小管^#3$4&symptom_desc*病变^#5$6&symptom_deco*轻度^"
    before_res = "#0$2&symptom_obj*肾小管^#3$4&symptom_desc*病变^"

    示例：
    text = "肾小管(obj)病变(desc)轻度(deco)。"
    不删除的原始结果:
    肾小管病变
    肾小管病变轻度.

    如果res_seg中的结果符合以下特征，则将前一个desc的结果删掉:
    <1> 2个结果中出现同一个desc
    <2> 前一条结果中没有deco，后一条结果中有deco(而且是后置的特殊deco)  --> 非常重要的判断依据

    满足这2点，则将 "肾小管病变" 这一句结果从res_seg 中删掉


    一个不用删除的示例：
    text = "肾小管(obj) 部分(deco) 增厚(desc) 较明显(deco)"
    不删除的原始结果:
    肾小管部分增厚
    肾小管增厚较明显

    这个示例中，条件<1> 是满足的 --> 2个结果中都有同一个desc: 增厚
    但是，不满足条件<2> --> 因为第一个结果中，有deco"部分", 所以这个结果不能删除.
    """

    can_delete = False

    while True:
        if len(res_seg) <= 1:
            # 只有一个res, 不能删除
            break

        if len(desc_tag) == 0:
            # 没有前项desc, 不能删
            break

        # 从列表中取出字符串, 以便和curr_res / before_res 比较
        desc_tag = desc_tag[0]
        # curr_res = "肾小管病变轻度"
        # before_res = "肾小管病变", 这个函数就是检查 before_res 能不能删
        curr_res = "".join(res_seg[-1])
        before_res = "".join(res_seg[-2])

        if (desc_tag in curr_res) and (desc_tag in before_res):
            if "symptom_deco" not in before_res:
                can_delete = True

        break

    return can_delete


def judge_case(seg, text, res_seg, i, stack):
    """
    功能函数4 -- 判断case 到底是正常的deco, 还是倒序的特殊deco
    """

    # step 1 定义初始 case
    case = "Normal"

    while True:
        # step 2 根据规则，找到特殊情况
        # 2.1 先找到当前deco的前一个desc, 和下一个desc 在 text 中的索引
        # 并且, stack["special_pre_desc"] 的赋值, 就是在这个函数中完成的
        pre_desc_idx_in_text, next_desc_idx_in_text = get_symptom_desc_idx_from_text(seg, text, i, stack)

        # 如果前项desc是None, 说明前面没有desc, 则不必进行下面所有的判断, 因为当前就是deco+desc的正常顺序，将deco入栈即可.
        if (pre_desc_idx_in_text is None) and (next_desc_idx_in_text is not None):
            break
        # 如果deco是最后一个seg，那么直接和前一项desc拼.
        if (pre_desc_idx_in_text is not None) and (next_desc_idx_in_text is None):
            if not has_comma_between_me_and_desc("previous_desc", seg, text, i, pre_desc_idx_in_text, stack):
                case = "BuildWorkFlow"
            break

        # 2.2 如果当前deco和前一个desc之间有标点，且和下个desc之间也有标点，则这种deco可能就是其中一个的倒序deco，这种deco暂不入栈.
        # me就是自己，当前的symptom_deco
        has_comma_pre = has_comma_between_me_and_desc("previous_desc", seg, text, i, pre_desc_idx_in_text, stack)
        has_comma_next = has_comma_between_me_and_desc("next_desc", seg, text, i, next_desc_idx_in_text, stack)

        # 2.3 分3种情况:
        # a 与之前desc没有逗号（关系更紧密）, 与后项有逗号（关系不紧密） --> 要和之前拼, 需要吐结果
        if (not has_comma_pre) and has_comma_next:
            case = "BuildWorkFlow"

        # b 与之前desc有逗号（关系不紧密）, 与后项之间没有逗号（关系紧密) --> 要和之后拼, 所以入栈，但是不吐结果
        # 也就是 case = Normal 的正常操作
        elif has_comma_pre and (not has_comma_next):
            pass

        # c 之前之后都有标点(前后关系一样松，不紧密): 只能人为规定 --> 默认和前面拼, 需要吐结果
        # 肝脏光滑(desc), 以右下方为著(deco), 无异常(desc)。
        # 结果: [肝脏光滑以右下方为著,
        #       肝脏无异常]
        elif has_comma_pre and has_comma_next:
            case = "BuildWorkFlow"

        # d 之前之后都没有标点(前后关系都很紧密): 人为规定 --> 默认和后面的拼, 也就是入栈，但是不吐结果
        elif (not has_comma_pre) and (not has_comma_next):
            pass

        # 最后无论什么情况，跳出while循环
        break

    return case


def do_case_build_work_flow(seg, text, res_seg, i, stack):
    """
    功能函数5 -- 如果case = "BuildWorkFlow", 则调用该函数

    before_res_seg_length 和 after_res_seg_length 作用: 判断是否删除res_seg中的前一个结果(因为有可能一个desc重复拼了2次)
    same_desc_build_twice函数: 具体判断 "是否删除前一个结果" 的逻辑判断函数
    """

    # 因为build work flow的第一步就是入栈，所以push stack就在build work flow里进行了
    stack["special_can_build_deco"] = seg[i]
    before_res_seg_length = len(res_seg)

    res_seg, stack = build_work_flow(seg, text, res_seg, i, stack)
    after_res_seg_length = len(res_seg)

    # 如果拼接成功，则把前一个desc的结果删掉，否则前一项desc就重复拼了2个结果
    if after_res_seg_length == before_res_seg_length + 1:
        # 这里判断是否可以删除
        if same_desc_build_twice(res_seg, desc_tag=stack["special_pre_desc"]):
            if len(res_seg) > 1:
                res_seg.pop(-2)
            else:
                res_seg.pop()

    return res_seg, stack


def handle_symptom_deco(seg, text, res_seg, i, stack):
    """
    主函数

    # 倒序特殊情况, desc"积气" 拼不到 deco"以左上腹部结肠内稍多"
    # 原文: "腹部立位平片示：腹部肠管内少量积气，以左上腹部结肠内稍多，未见明显扩张及液气平面，双膈下未见游离气体。"

    判断规则:
    若遇到特殊symptom_deco: "以左上腹部结肠内稍多", 那么检查原文本text:
    如果它和前后2个symptom_desc ("积气"和"扩张")之间都有标点符号隔开，那么这种特殊 symptom_deco 和前一项desc"积气"拼在一起.
    """

    # step 1 定义初始 case
    case = judge_case(seg, text, res_seg, i, stack)

    # step 2 跟据 case 情况处理
    if case == "Normal":
        stack[seg[i][2]].append(connect(seg[i]))

    elif case == "BuildWorkFlow":
        res_seg, stack = do_case_build_work_flow(seg, text, res_seg, i, stack)

    # step 3 最后，清除特殊stack
    stack["special_pre_desc"] = []

    return res_seg, stack
