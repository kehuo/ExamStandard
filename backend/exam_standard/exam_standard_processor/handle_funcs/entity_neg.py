from exam_standard.exam_standard_processor.utils import connect
from exam_standard.exam_standard_processor.logic.bu_build_work_flow import build_work_flow


def handle_entity_neg(seg, text, res_seg, i, stack):
    """
    因为Tagging模型可能会标注错误，所以如果entity_neg被标注成最后一个tag, 也拼出来.

    一个Tagging标注错误的例子, 导致 entity_neg 被标成最后一个:
    text = "肺野内未见异常密度影。"
    wrong_tag_list =
    [0, 2, 'symptom_obj', '肺野内']
    [3, 9, 'entity_neg', '未见异常密度影']
    [10, 10, 'vector_seg', '。']

    正确的应该是:
    [0, 2, 'symptom_obj', '肺野内']
    [3, 6, 'reversed_exam_result', '未见异常']
    [7, 9, 'reversed_exam_item', '密度影']
    [10, 10, 'vector_seg', '。']

    """

    # 遇到句末，无论什么情况，都拼出一个结果 (Tagging模型可能会标注错误)
    if i < len(seg) - 1:
        stack[seg[i][2]] = [connect(seg[i])]

    else:
        res_seg, stack = build_work_flow(seg, text, res_seg, i, stack)

    return res_seg, stack
