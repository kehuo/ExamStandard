from exam_standard.exam_standard_processor.handle_funcs.entites import Entity
from exam_standard.exam_standard_processor.handle_funcs.symptom_obj import \
    has_pos_or_part_between_curr_obj_and_previous_obj


def connect_me_and_pos(me, stack):
    """
    功能函数 1 -- 根据情况, 判断是否和pos拼接
    """

    # pre_pos 共3个key, "val"是值, "bundled_with_obj/part" 是标志位, 代表的意义是: 是否已经和其他obj/part绑定过
    pre_pos = stack["pre_pos"]

    while True:
        if not pre_pos["val"]:
            break

        if pre_pos["bundled_part"] is not None:
            break

        if pre_pos["bundled_obj"] is not None:
            break

        me.prepos = pre_pos["val"]
        pre_pos["bundled_part"] = me

        break

    return me, stack


def delete_useless_from_children_list(seg, text, i, stack):
    """
    功能函数2 -- 判断情况，从children中弹出一些不再需要的项

    定义变量 delete_count, 表示需要从 children 中弹出的项的个数
    """

    for f_idx in range(len(stack["forest"]) - 1, - 1, - 1):
        delete_count = 0
        # c 是一个列表 = [children1, children2, ...]
        c = stack["forest"][f_idx].children
        if len(c) > 0:
            for c_idx in range(len(c) - 1, - 1, - 1):
                # 若children列表中遇到obj, 则不用继续判断，因为part和obj没有可比性
                if c[c_idx].etype == "symptom_obj":
                    break

                # 若遇到part, 判断2个part之间是否有逗号、分号、句号, 若有，则弹出数量+1
                # 示例1: "肝包膜part1、皮质part2光滑", 皮质和包膜之间是顿号，没有逗号/句号/分号，所以 part1包膜 不用弹出
                # 示例2: "肝包膜光滑, 皮质均匀", 皮质 和 包膜 之间有逗号，所以 包膜 要从 children 中弹出
                # 示例3: "一个肾小球(obj)基质(part1)增生伴内皮细胞(part2)增生。" > part1和part2之间有"伴", 所以part1基质弹出.
                elif c[c_idx].etype == "object_part":
                    sub_text = text[c[c_idx].start_idx:seg[i][0]]
                    for comma in ["，", "。", "；", "伴"]:
                        if comma in sub_text:
                            delete_count += 1
                            break

            # 根据 delete_count 需要弹出的数量，从children 中移出
            if delete_count > 0:
                stack["forest"][f_idx].children = \
                    stack["forest"][f_idx].children[:len(stack["forest"][f_idx].children) - delete_count]

    return stack


def handle_object_part(seg, text, res_seg, i, stack):
    """
    主函数 (2019-11-22 周五 更新注释及处理方式)

    1 me = Entity()
    2 调用函数connect_me_and_pos， 将pos赋值给自己的prepos属性
    3 判断forest栈的情况:
        3.1 若为空 --> 将自己放入forest, 并且置特殊 stack["curr_forest_is_temp_obj_part"] = True
        3.2 若不为空 --> 检查 stack["curr_forest_is_temp_obj_part"] 是否为True
            a. 为True --> 说明forest是临时栈，里面只有一个obj_part --> 将forest清空 --> 将自己放入 --> 保持特殊栈继续为True
            b. 为False --> 说明forest是正常栈，里面是正常的obj节点 --> 跳到步骤4

    4 调用功能函数2， 查看forest中的children列表，并弹出一些不必要的项
    5 将自己赋值给 forest中的children列表
    6 最后, 将last_entity 赋值为自己

    注意: step 5 中:
        <1> 若2个forest.complete之间有 pos/part隔开，则说明这个forest（即obj）之间关系不太紧密，当前的part不拼给前一个forest
        示例 双肾区、双输尿管径路及膀胱区无异常。
        遇到径路part时，因为curr_obj是输尿管，pre_obj是肾区。因为中间隔了一个pos"双"，所以curr_obj和pre_obj关系没有那么紧密
        所以只拼给curr_obj , 而不拼给pre_obj

        <2> 分2情况，如果只有1个forest，那么简单处理即可.
    """

    ###################
    # 以下注释掉的部分是 2910-11-22 之前使用的处理方式
    # # step 1
    # me = Entity(seg[i])
    #
    # # step 2
    # me, stack = connect_me_and_pos(me, stack)
    #
    # if stack["forest"]:
    #     # step 3 查看obj的children, 并从中弹出不必要的项
    #     stack = delete_useless_from_children_list(seg, text, i, stack)
    #
    #     # step 4 将自己放入 children 列表
    #     # 需要注意:
    #     # <1> 若2个forest.complete之间有 pos/part隔开，则说明这个forest（即obj）之间关系不太紧密，当前的part不拼给前一个forest
    #     # 示例 双肾区、双输尿管径路及膀胱区无异常。
    #     # 遇到径路part时，因为curr_obj是输尿管，pre_obj是肾区。因为中间隔了一个pos"双"，所以curr_obj和pre_obj关系没有那么紧密
    #     # 所以只拼给curr_obj , 而不拼给pre_obj
    #     #
    #     # <2> 分2情况，如果只有1个forest，那么简单处理即可.
    #     if len(stack["forest"]) == 1:
    #         stack["forest"][0].children.append(me)
    #
    #     else:
    #         for f_idx in range(len(stack["forest"]) - 1, 0, -1):
    #             curr_obj = stack["forest"][f_idx].complete
    #             pre_obj = stack["forest"][f_idx - 1].complete
    #
    #             # 若被隔开了，则给curr_obj拼完后 直接break
    #             if me not in stack["forest"][f_idx].children:
    #                 stack["forest"][f_idx].children.append(me)
    #             if has_pos_or_part_between_curr_obj_and_previous_obj(seg, curr_obj, pre_obj):
    #                 break
    #             # else: 每隔开，则前一项也拼
    #             stack["forest"][f_idx - 1].children.append(me)
    #
    # stack["last_entity"] = me
    #
    # return res_seg, stack
    ##############################

    # 以下是 2019-11-22 更新的新处理方式
    # step 1
    me = Entity(seg[i])

    # step 2
    me, stack = connect_me_and_pos(me, stack)

    # step 3 判断forest
    while True:
        # 3.1
        if len(stack["forest"]) == 0:
            stack["forest"].append(me)
            stack["curr_forest_is_temp_obj_part"] = True
            break

        # 3.2 - a
        if stack["curr_forest_is_temp_obj_part"] is True:
            stack["forest"].pop()
            stack["forest"].append(me)
            break

        # 3.2 - b 正常 --> 跳转到 step 4
        # step 4
        stack = delete_useless_from_children_list(seg, text, i, stack)

        # step 5
        if len(stack["forest"]) == 1:
            stack["forest"][0].children.append(me)

        else:
            for f_idx in range(len(stack["forest"]) - 1, 0, -1):
                curr_obj = stack["forest"][f_idx].complete
                pre_obj = stack["forest"][f_idx - 1].complete

                # 若被隔开了，则给curr_obj拼完后 直接break
                if me not in stack["forest"][f_idx].children:
                    stack["forest"][f_idx].children.append(me)
                if has_pos_or_part_between_curr_obj_and_previous_obj(seg, curr_obj, pre_obj):
                    break
                # else: 每隔开，则前一项也拼
                stack["forest"][f_idx - 1].children.append(me)

        # 最后无论什么情况，跳出while循环
        break

    # step 6
    stack["last_entity"] = me

    return res_seg, stack
