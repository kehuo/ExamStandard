from exam_standard.exam_standard_processor.utils import connect


def handle_treatment(seg, text, res_seg, i, stack):
    stack[seg[i][2]].append(connect(seg[i]))

    return res_seg, stack
