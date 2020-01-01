from exam_standard.exam_standard_processor.logic.bu_build_work_flow import build_work_flow
from exam_standard.exam_standard_processor.handle_funcs.reversed_exam_item import check_clean_timing


def handle_exam_result(seg, text, res_seg, i, stack):
    res_seg, stack = build_work_flow(seg, text, res_seg, i, stack)

    # 通过以下函数，判断是否可以清空变量
    # 该函数定义在handle_reversed_item中，因为reversed_item处理逻辑基本和exam_result完全一致, 所以可以套用同样的判断函数
    can_clean_stack = check_clean_timing(seg, text, i)
    if can_clean_stack:
        stack["exam_item"] = []
        stack["symptom_deco"] = []

    return res_seg, stack
