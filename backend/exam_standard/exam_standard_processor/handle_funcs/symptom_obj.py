from exam_standard.exam_standard_processor.handle_funcs.entites import Entity
from exam_standard.exam_standard_processor.utils import connect


def is_parallel_between_two_obj(last_obj, current_obj, text):
    """
    功能函数 1 -- 检查2个obj之间关系
    current_obj = Entity()
    text_start_idx 和 text_end_idx: 从text原文本中切出一段字符串，判断这段字符串中是否有"、"，"及"，"和"等等连接词.
    "关节objA囊 和 关节objB周围软组织...." --> objA 和 objB 之间有 "和", 所以是并列
    """

    is_parallel = False
    flags = ["、", "和", "及"]

    text_start_idx = last_obj.end_idx
    text_end_idx = current_obj.start_idx

    # 如果2个obj紧紧相连，也算做并列
    if text_start_idx + 1 == text_end_idx:
        is_parallel = True

    # 若没有紧连着，则需要查看标点符号
    else:
        for flag in flags:
            if flag in text[text_start_idx:text_end_idx]:
                is_parallel = True
                break

    return is_parallel


def current_obj_is_children_obj(last_obj, current_obj, text):
    """
    功能函数 2 -- 查看2个obj是否是从属关系
    """

    is_children_obj = False

    return is_children_obj


def filter_special_obj(seg, text, i):
    """
    功能函数 3 -- 将"腹部obj 正位片exam: " 中的"腹部", 这种特殊obj过滤出来，不放入forest中
    而是将 腹部正位片 整体作为 exam
    """

    valid_obj = True

    if seg[i + 1][2] == "exam":
        next_char_idx = seg[i + 1][1] + 1
        if next_char_idx < len(text) - 1:
            if text[next_char_idx] in ["示", "：", "，"]:
                valid_obj = False

    return valid_obj


def has_pos_or_part_between_curr_obj_and_previous_obj(seg, current_obj, previous_obj):
    """
    功能函数 4 - 判断当前obj 和 stack["pre_pos"]["budnled_obj"] 之间是否有 pos或者part夹在中间
    """

    res = False
    curr_obj_idx, pre_obj_idx = None, None
    for i in range(len(seg)):
        if connect(seg[i]) == previous_obj:
            pre_obj_idx = i
            continue
        if connect(seg[i]) == current_obj:
            curr_obj_idx = i

    # 如果不紧连着，才继续判断
    check_list = ["symptom_pos", "object_part"]
    if curr_obj_idx - pre_obj_idx != 1:
        for check_tag in check_list:
            if check_tag in [j[2] for j in seg[pre_obj_idx + 1:curr_obj_idx]]:
                res = True
                break
    return res


def connect_me_and_pos(seg, text, me, stack):
    """
    功能函数 5 -- 根据情况，给当前obj绑定pos
    bundled_obj: symptom_pos最近绑定过的 obj
    bundled_part: symptom_pos最近绑定过的 object_part

    流程中需要注意的一点， 示例：
    双肾区、双输尿管径路及膀胱区未见阳性结石影。

    1 这个函数中如果 bundled_obj 不为空，则需要判断2个obj之间的关系
    2 在判断2个obj的关系之前，先判断：2个obj之间是否有其他tag（比如pos/part）
    3 若2个obj之间有pos/part，则间接说明后面的obj不太应该和前面的pos拼，因为前面的几项，你可以认为已经构成了一个相对封闭的圈子了。
    如：
    a. 肾区 和 输尿管 之间有 第二个"双" 这个pos，则不必判断他俩的关系，因为这个夹在中间的双，已经让肾区和输尿管的联系没有那么紧密了。
    b. 输尿管 和 膀胱之间 有一个"径路part", 则他俩之间也不必判断关系，因为输尿管和径路已经构成一个相关封闭的圈子，膀胱了输尿管关系没有那么紧密了。
    """

    pre_pos = stack["pre_pos"]

    while True:
        # 若当前没有pre_pos，直接跳出
        if not pre_pos["val"]:
            break

        # 若和part绑定过, 直接跳出
        if not pre_pos["bundled_part"] is None:
            break

        # 若和obj绑定过, 则需要判断和last_entity的关系
        # 按照注释，判断关系前，先判断2个obj之间是否有pos/part来离间2个obj之间的关系（若有，则关系不亲密，无需判断is_parallel函数了）
        if not pre_pos["bundled_obj"] is None:
            # 先判断2obj之间是否有pos/part, 若有，则2个obj的关系不够紧密，不需要再判断关系，直接break,不拼这个pos
            if has_pos_or_part_between_curr_obj_and_previous_obj(seg,
                                                                 current_obj=me.complete,
                                                                 previous_obj=stack["pre_pos"]["bundled_obj"].complete):
                break
            if pre_pos["val"] == pre_pos["bundled_obj"].prepos:
                # 若和bundled_obj不是并列关系, 则break跳出
                if not is_parallel_between_two_obj(pre_pos["bundled_obj"], me, text):
                    break

        me.prepos = pre_pos["val"]
        pre_pos["bundled_obj"] = me

        break

    return me, stack


def handle_symptom_obj(seg, text, res_seg, i, stack):
    """
    主函数
    处理pos/obj/part 3个检查主体的标签. 使用的stack有:
    stack["forest"]: 记录所有obj树，并在build_work_flow时调用get_branches,取出每棵树中所有的 branches
    stack["last_obj"]: 记录上一个obj, 用来判断当前obj和上一个obj的关系
    stack["last_entity"]: 记录上一个entity, 可能是part，也可能是obj，用来判断pos如何与obj或者part拼接
    stack["pre_pos"] = {"val": "#0$1&symptom_pos*双侧^",
                        "bundled_obj": None,
                        "bundled_part: None}
                        该stack用来记录pos和其他obj/part绑定的情况. 用来判断如何将pos绑定给obj/part

    判断流程 (2019-11-22 周五 更新):
    1 me = Entity()
    2 filter_special_obj函数，将"腹部正位片:"这种特殊obj过滤掉(因为已经和handle_exam时处理过了)
        2.1 函数返回True > 跳转到 3
        2.1 函数返回False > 不做任何处理

    3 connect_me_and_pos函数, 根据情况拼接pos:
        3.1 若该pos已经和part绑定, 那直接跳出
        3.2 若该pos已经和obj绑定过, 则判断关系: 并列 --> 自己也绑; 不并列--> 不绑
        3.3 绑定完后, 将pre_pos["bundled_with_obj"]标志位置为 True

    4 根据情况判断放入 stack["forest"]
        4.1 检查last_obj
            a. 若无 > 检查特殊栈 curr_forest_is_temp_obj_part:
                a-1. 特殊栈为 True > 清空 forest 栈 > 将自己放入 > 并且置 curr_forest_is_temp_obj_part = False
                a-2. 特殊栈为 False > 直接将自己放入 forest
            b. 若有 > 判断自己和last_obj关系
                b-1 并列 > 将自己放入forest, 并且将last_obj 置为自己
                b-2 不并列 > "从属" / "不并列也不从属" > 具体实现

    5 将 last_entity 赋值为自己
    """

    # step 1
    me = Entity(seg[i])

    # step 2
    valid_obj = True
    if i < len(seg) - 1:
        valid_obj = filter_special_obj(seg, text, i)

    if valid_obj:
        # step 3
        me, stack = connect_me_and_pos(seg, text, me, stack)

        # step 4
        # 4.1 - a
        if not stack["last_obj"]:
            # a - 1
            if stack["curr_forest_is_temp_obj_part"]:
                stack["forest"].pop()
                stack["forest"].append(me)
                stack["curr_forest_is_temp_obj_part"] = False
            # a - 2
            else:
                stack["forest"].append(me)
                stack["last_obj"] = me

        # 4.2 - b
        else:
            # b - 1 (并列)
            if is_parallel_between_two_obj(stack["last_obj"], me, text):
                stack["forest"].append(me)
                stack["last_obj"] = me

            # b - 2 不并列
            else:
                # 从属
                if current_obj_is_children_obj(stack["last_obj"], me, text):
                    stack["last_obj"].children.append(me)

                # 不并列也不从属
                else:
                    stack["forest"] = list()
                    stack["forest"].append(me)
                    stack["last_obj"] = me
        # step 5
        stack["last_entity"] = me

    return res_seg, stack
