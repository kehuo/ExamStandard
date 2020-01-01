stack_key_list = [
    "forest", "branches",
    "exam_item", "exam_result",
    "symptom_deco", "symptom_desc",
    "reversed_exam_result", "reversed_exam_item",
    "entity_neg",
    "lesion", "lesion_desc",
    "exam",
    "time",
    "medical_events",
    "treatment", "treatment_desc",
    "symptom",
    "medicine",
    "disease", "disease_desc",
    # cont 和 none 不需要处理, 但是nlp-seg 模型标注结果中有这2个标签类型, 为了避免keyerror, 在这里加入, 但是实际不做任何处理.
    "cont", "none"
]


def init_stack():
    stack_dict = dict()
    for key in stack_key_list:
        stack_dict[key] = []

    # last added obj, 记录上一个obj
    stack_dict["last_obj"] = None

    # 前置pos
    stack_dict["pre_pos"] = {
        "val": "",
        "bundled_obj": None,
        "bundled_part": None
    }

    # last entity 既记录obj，也记录part
    stack_dict["last_entity"] = None

    # 以下几个特殊的stack，用来处理特殊情况的拼接:

    # 1 special_can_build_deco: 一个特殊的标志位，在handle_symptom_deco中使用.
    # 逻辑: 遇到 descA + deco + descB 结构时, 如果deco和前面的descA拼，那么需要用到这个特殊的stack
    stack_dict["special_can_build_deco"] = None
    # 2 special_pre_desc: 在 build_work_flow 的 can_build 函数中，检查是否是一个合适的拼接时机
    # 作用: 帮助deco记录前一项descA, 完成逆序的desc + deco 的拼接
    stack_dict["special_pre_desc"] = []

    # 3 special_obj_between_desc_and_comma, 在handle_symptom_desc 函数中使用
    # 作用: 遇到 desc + obj + 逗号 的结构时，用这个satck提前获取obj，并且拼出一个结果
    stack_dict["special_obj_between_desc_and_comma"] = []

    # 4 curr_forest_is_temp_obj_part: 在 handle_obj/handle_part 中使用
    # 用来标志当前stack["forest"]的状态 --> forest中目前只有一个临时的obj_part节点，没有obj节点
    stack_dict["curr_forest_is_temp_obj_part"] = False

    return stack_dict
