from exam_standard.exam_standard_processor.logic.bu_build_work_flow import build_work_flow


def handle_disease(seg, text, res_seg, i, stack):
    """
    清变量的时机: 遇到逗号，句号或者分号时
    test = "考虑为肾小球轻微病变，不除外局灶节段肾小球硬化症，请结合临床及电镜。"
    target = [[0,1,"disease_desc"],
              [3,9,"disease"],  # 这里遇到逗号，清变量
              [10,10,"vector_seg"],

              [11,13,"disease_desc"],
              [14,17,"disease_desc"],
              [18,23,"disease"],  # 这里遇到逗号，清变量
              [24,24,"vector_seg"],

              [33,33,"vector_seg"]]

    """
    res_seg, stack = build_work_flow(seg, text, res_seg, i, stack)

    # 清变量
    if i < len(seg) - 1:
        if text[seg[i][1] + 1] in ["，", "。", "；", ","]:
            stack["disease_desc"] = []

    return res_seg, stack
