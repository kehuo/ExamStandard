from exam_standard.exam_standard_processor.logic.bu_build_work_flow import build_work_flow
from exam_standard.exam_standard_processor.handle_funcs.reversed_exam_item import check_clean_timing


def handle_lesion(seg, text, res_seg, i, stack):
    """
    2019-11-22 更新 "清空stack" 的处理方式
    示例：
    右侧胸壁obj 可见 1个(lesion_desc) 椭圆形(lesion_desc) 异常信号影(lesion) 向外凸起(lesion_desc)

    该示例中，遇到lesion时，虽然check_build_timing是False, 但是暂时不能将 1个 和 椭圆形 清空，需要判断.
    """

    res_seg, stack = build_work_flow(seg, text, res_seg, i, stack)

    # 旧的处理方式
    # stack["lesion_desc"] = []

    # 新的处理方式
    if check_clean_timing(seg, text, i) is True:
        stack["lesion_desc"] = []
        # 考虑下面这个示例，在当前lesion后面是逗号的情况下，需要将之前的exam_item 和 exam_result 也清空
        # 示例:
        # 上颌窦obj 见一 大小exam_item 正常exam_result 的低密度灶，CT值exam_item 为37HU exam_result.
        # 遇到"低密度灶"lesion时， 需要将 "大小"exam_item 和 "正常"exam_result清空
        stack["exam_item"] = []
        stack["exam_result"] = []
    return res_seg, stack
