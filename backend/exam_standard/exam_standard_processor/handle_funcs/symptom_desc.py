from exam_standard.exam_standard_processor.logic.bu_build_work_flow import build_work_flow
from exam_standard.exam_standard_processor.utils import connect


def search_next_comma_index_from_text(curr_desc, text):
    """
    功能函数1 -- 找到离当前desc 最近的下一个 逗号/分号/句号, 并且返回当前这个标点在文本中的索引

    sub_text: 从当前desc 到text末尾的这段文本，我们要从这段文本中找到 离自己最近的那个标点符号, 从而截取到最终返回的res文本
    """
    next_comma_index = None
    punctuations = ["，", "。", ";"]

    start = curr_desc[1] + 1
    sub_text = text[start:]
    for idx in range(len(sub_text)):
        if sub_text[idx] in punctuations:
            # 注意idx是sub_text的索引，所以最终结果要加上start
            next_comma_index = start + idx
            break

    return next_comma_index


def has_another_desc_between_me_and_next_comma(seg, next_comma_index, i):
    """
    功能函数2 -- 通过功能函数1返回的标点符号的索引， 从seg中过滤出当前tag和逗号之间的所有tag，并且判断其中是否有另一个descB
    :return: True: 有descB;  False: 没有descB

    step1 初始化一些变量
    step2 尝试从seg中过滤出一部分tag
    step3 在2的基础上，如果能找到则判断，如果seg_end_idx=None, 则不判断step3(可以避免一些index error)
    """

    # step 1
    has_another_desc = False
    another_desc_tag = None

    seg_start_idx = i + 1
    seg_end_idx = None
    # 一般来说，如果当前desc是全部文本的最后一个tag，那么下面的判断是不会有结果的，所以seg_end_idx会是None, 不会进行step3的判断
    for idx in range(i, len(seg)):
        if idx < len(seg) - 1:
            if seg[idx][0] > next_comma_index:
                seg_end_idx = idx
                break

        # 如果下一个descB, 是当前seg的最后一项, 那么直接将seg_end_idx置为 len(seg) - 1
        else:
            seg_end_idx = len(seg)

    if seg_end_idx:
        # 从这段seg中找，是否有descB
        for each_tag in seg[seg_start_idx: seg_end_idx]:
            if each_tag[2] == "symptom_desc":
                # 有descB
                has_another_desc = True
                another_desc_tag = each_tag
                break

    return has_another_desc, another_desc_tag


def has_connective_word_between_curr_desc_and_next_desc(curr_desc, next_desc, text):
    """
    功能函数3 -- 判断2个desc之间是否有 "及" "和"等连接词(connective word)
    """
    has_connective_word = False
    connective_word_list = ["和", "及", "或"]

    start = curr_desc[1] + 1
    end = next_desc[0]
    sub_text = text[start:end]
    for char in sub_text:
        if char in connective_word_list:
            has_connective_word = True
            break

    return has_connective_word


def handle_symptom_desc(seg, text, res_seg, i, stack):
    """
    这里会用到特殊的stack: special_obj_between_desc_and_comma
    当一个obj夹在一个desc和逗号之间时，这种 desc + obj 的结构，会强行拼出一个结果

    特殊的示例：
    送检肾穿刺组织见25个肾小球，

    遇到25个(desc) + 肾小球(obj) + "，"逗号的结构时，需要拼出 "25个肾小球"这句结果

    处理完成后，清空一些stack的处理方式 (2019-11-22更新)
    1 清空 stack["special_obj_between_desc_and_comma"]
    2 清空 stack["symptom_deco"]
        2.1 如果是 deco + descA(当前) + descB >> 不清，因为descB还要和deco拼;
        2.2 如果是 decoX + descA(当前) + decoY + descB >> 将decoX清空，因为descB不和decoX拼，只和decoY拼
    3 清空 stack["entity_neg"], 流程如下:
        3.1 找到当前descA 之后离最近的一个 逗号/分号/句号.
        3.2 从自己 - 句号之间，是否有其他descB
            a 没有 >> 清空entity_neg
            b 有 >> 判断 descA 和 descB 是否在文本上连续 (比如 未entity_neg增大descA增粗descB)
                b - 1 连续 >> 不清 entity_neg, 因为descB 也要拼
                b - 2 不连续 >> 判断descA 和 descB 之间有没有 "和" "及" "以及" 等连接词
                    b-2-1 有连接词 >> 不清空
                    b-2-2 没有连接词 >> 清空entity_neg

    不清空entity_neg的示例：
    text = 椎体obj 未见entity_neg 破坏descA 及 增生descB
    结果: 椎体未见破坏
        椎体未见增生
    """

    case = "Normal"

    while True:
        if i == len(seg) - 1:
            break
        # 判断1 -- 后一项是否为obj
        if seg[i + 1][2] != "symptom_obj":
            break

        # 判断2 -- obj后面是标点符号 (满足 desc + obj + 标点 的结构)
        index = seg[i + 1][1]
        if text[index + 1] in ["，", "。", "；"]:
            # case转成 "和后一项obj强行build work flow"
            case = "BuildWorkFlow_with_next_Symptom_obj"

        break

    # 如果是特殊情况，则将自己后面的obj，提前"预支"到特殊stack中
    if case == "BuildWorkFlow_with_next_Symptom_obj":
        stack["special_obj_between_desc_and_comma"].append(connect(seg[i + 1]))

    res_seg, stack = build_work_flow(seg, text, res_seg, i, stack)

    ##################
    # 以下注释掉的部分是旧的清空 部分stack的方式
    # # 清变量
    # if i < len(seg) - 1:
    #     if seg[i+1][2] != seg[i][2]:
    #         stack["symptom_deco"] = []
    #         stack["entity_neg"] = []

    ################

    # 以下是2019-11-22 更新的 清空一些stack的处理方式
    if i < len(seg) - 1:
        # 先清空特殊栈, 以免后面的 symptom_desc 也拼到这个特殊obj, 造成错误
        stack["special_obj_between_desc_and_comma"] = []

        # 清deco的逻辑: 如果不是 deco + descA + descB > 那么descA拼完deco后，就将deco从stack中清掉
        if seg[i + 1][2] != seg[i][2]:
            stack["symptom_deco"] = []

        # 清entity_neg的逻辑:
        while True:
            # 3.1 找到自己-标点之间的这部分文本
            next_comma_index = search_next_comma_index_from_text(curr_desc=seg[i], text=text)
            if next_comma_index is None:
                stack["entity_neg"] = []
                break

            # 3.2
            has_another_desc, another_desc_tag = has_another_desc_between_me_and_next_comma(seg, next_comma_index, i)

            # 3.2-a 没有descB >> 直接清空
            if not has_another_desc:
                stack["entity_neg"] = []
                break

            # 3.2-b 有descB
            # b-1 连续 > 不清空
            if seg[i][1] + 1 == another_desc_tag[0]:
                break

            # b-2 不连续 > 中间是否有 "及" "和" "或" 连接词
            has_connective_word = has_connective_word_between_curr_desc_and_next_desc(curr_desc=seg[i],
                                                                                      next_desc=another_desc_tag,
                                                                                      text=text)
            # b-2-1 有连接词, 不清空
            if has_connective_word:
                break

            # b-2-2 没有连接词, 清空
            stack["entity_neg"] = []

            # 最后跳出 while 循环
            break
    return res_seg, stack
