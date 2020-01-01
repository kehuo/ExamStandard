from exam_standard.exam_standard_processor.utils import connect


def handle_exam(seg, text, res_seg, i, stack):
    # step 1 定义初始状态
    stack[seg[i][2]] = [connect(seg[i])]
    case = "Normal"

    # step 2 判断特殊情况
    if i >= 1:
        # 如果exam的前一项是obj, 并且obj和该exam在原文本中是紧连着，后面跟的是 "示" 或者冒号"："，这种属于特殊obj，要和当前exam绑定.
        # 肾血流灌注像示：腹主动脉清晰显影
        # 肾功能像示：静脉注射后1分钟左肾显影
        # 肾图示：双侧肾图呈持续上升型。
        if seg[i-1][2] == "symptom_obj":

            # 检查前一项 obj 和当前项 exam ，是否在原文本text中是相连的，尽量避免错误地拼到相隔太远的 obj
            if seg[i][0] - 1 == seg[i-1][1]:
                next_char_idx = seg[i][1] + 1
                if text[next_char_idx] in ["示", "：", "，"]:
                    # case 名"Concat Previous Obj" 是指 "和前一项obj拼接"
                    case = "ConcatPreviousObj"

    # step 3 根据 case，赋值
    if case == "ConcatPreviousObj":
        stack[seg[i][2]] = [connect(seg[i - 1]) + connect(seg[i])]

    return res_seg, stack
