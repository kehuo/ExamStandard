from exam_standard.exam_standard_processor.utils import connect


def has_comma_between_me_and_next_entity(seg, text, i):
    """
    功能函数 1 -- 检查原文本text, 判断当前pos(也就是me), 和下一个entity(obj/part)之间是否有逗号/分号/句号

    示例:
    text = "左，肾大小正常"
    sub_text = "左，肾"
    因为sub_text中有逗号，所以 has_comma = True
    """

    has_comma = False

    start = seg[i][1]
    end = seg[i + 1][0]
    sub_text = text[start:end]
    for comma in ["，", "。", "；"]:
        if comma in sub_text:
            has_comma = True

    return has_comma


def handle_symptom_pos(seg, text, res_seg, i, stack):
    """
    判断流程:
    1 pos是否为seg最后一项
        1.1 若是 --> 很有可能拼错，break
        1.2 不是:

            2.1 下一项是否为 obj/part
                2.1.1 不是 --> 自己是后置pos, 若有last_entity, 则将自己赋值给last_entity的 afterpos属性
                2.1.2 是 --> 前置pos, 需要检查原文text，判断自己和后面的obj/part之间是否有标点
                                a 有标点 "左，肾大小正常" --> 错误，不拼
                                b 没标点 "左肾大小正常" --> 正确，拼

    """

    # pre_pos 共3个key, "val"是值, "bundled_obj/part" 是标志位, 代表的意义是: 已经和当前pos绑定过的 obj/part
    pre_pos = stack["pre_pos"]

    while True:
        if i == len(seg) - 1:
            break

        if not seg[i + 1][2] in ["symptom_obj", "object_part"]:
            # 如果作为后置pos，则不用看自己和前项obj/part之间是否有标点
            # 示例1 ："肝大小正常, 其内光滑", pos其内 和 obj肝 之间，有逗号正常
            # 示例2 ："肝右侧大小正常"， pos右侧 和 obj肝 之间没有逗号，也正常
            if stack["last_entity"]:
                stack["last_entity"].afterpos = connect(seg[i])
                break

        # 作为前项pos时，需要检查原文本中，自己和后面的obj/part之间是否有逗号/分号/句号
        # 如果有，则不拼，因为 "左肾大小正常"是对的， 但是 "左，肾大小正常" 这种逗号一般标注正确的话，是不会出现的
        if has_comma_between_me_and_next_entity(seg, text, i):
            break

        # 前置pos "左侧" + "肾"
        pre_pos["val"] = connect(seg[i])
        pre_pos["bundled_obj"] = None
        pre_pos["bundled_part"] = None

        break

    return res_seg, stack
