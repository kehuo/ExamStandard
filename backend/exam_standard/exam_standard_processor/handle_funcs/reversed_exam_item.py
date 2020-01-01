from exam_standard.exam_standard_processor.logic.bu_build_work_flow import build_work_flow


def check_clean_timing(seg, text, i):
    """
    功能函数 - 检查是否可以清空stack, 流程如下:
    1 获取 itemA 和 itemB 2个tag之间的sub_text文本，这个例子中就是 "和"
    2 查看这段 sub_text 中是否有标点，比如句号/分号/逗号
    3 如果有，则可以清空 (因为标点符号意味着当前stack中的内容，和标点后面的内容，关系已经没有那么紧密了, 可以清空.)
    4 如果没有，不清空
    """

    punctuation_list = ["；", "，", "。"]
    can_clean = False
    if i < len(seg) - 1:
        next_tag = seg[i + 1]

        # 截取文本的起始和结束的索引:
        start = seg[i][1] + 1
        end = next_tag[0]
        sub_text_between_curr_tag_and_next_tag = text[start:end]

        for comma in punctuation_list:
            # 有逗号，则可以清空
            if comma in sub_text_between_curr_tag_and_next_tag:
                can_clean = True
                break
    return can_clean


def handle_reversed_exam_item(seg, text, res_seg, i, stack):
    """
    清空变量的处理方式:
    遇到逗号时，再清空变量，否则遇到以下情况，会少一条结构化结果.

    示例:
    "腹部obj 未见异常reversed_result 团块影reversed_itemA 和 异常钙化影reversed_itemB"

    在遇到 reversed_itemA 时，虽然check_build_timing是False，但是由于后面不是逗号，所以不能清空以下2个stack,否则
    "未见异常团块影" 这条结果就被删掉了.
    """

    res_seg, stack = build_work_flow(seg, text, res_seg, i, stack)

    # 判断是否可以清空stack的程序:
    can_clean = check_clean_timing(seg, text, i)

    # 根据结果，决定是否清空
    if can_clean:
        stack["reversed_exam_result"] = []
        stack["reversed_exam_item"] = []
    return res_seg, stack
