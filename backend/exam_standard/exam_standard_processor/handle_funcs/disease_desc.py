from exam_standard.exam_standard_processor.logic.bu_build_work_flow import build_work_flow


def handle_disease_desc(seg, text, res_seg, i, stack):
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

    特殊：(一连串前后没有标点的 disease和disease_desc)
    text = "结合临床，考虑狼疮性肾炎（Ⅳ-G（C）+Ⅴ）合并糖尿病肾病，请结合电镜（硬化球占83%）。"
    标注: [[5,6,"disease_desc"],
          [7,11,"disease"],
          [13,20,"disease_desc"],
          [22,23,"disease_desc"],
          [24,28,"disease"],
          [29,29,"vector_seg"],
          [33,34,"exam"],
          [36,38,"exam_item"],
          [39,42,"exam_result"],
          [44,44,"vector_seg"]]
    结果:
    ['#5$6&disease_desc*考虑^', '#7$11&disease*狼疮性肾炎^']
    ['#5$6&disease_desc*考虑^', '#24$28&disease*糖尿病肾病^']
    ['#7$11&disease*狼疮性肾炎^', '#13$20&disease_desc*Ⅳ-G（C）+Ⅴ^']
    ['#13$20&disease_desc*Ⅳ-G（C）+Ⅴ^', '#24$28&disease*糖尿病肾病^']
    ['#7$11&disease*狼疮性肾炎^', '#22$23&disease_desc*合并^']
    ['#22$23&disease_desc*合并^', '#24$28&disease*糖尿病肾病^']
    ['#33$34&exam*电镜^', '#36$38&exam_item*硬化球^', '#39$42&exam_result*占83%^']

    """

    res_seg, stack = build_work_flow(seg, text, res_seg, i, stack)

    # 清变量
    if i < len(seg) - 1:
        if text[seg[i][1] + 1] in ["，", "。", "；", ","]:
            stack["disease_desc"] = []

        # 如果值是一个问号，那么也需要直接将stack清空
        # 因为？大多情况下，代表他是对前面疾病的不确诊的描述，所以后面的疾病肯定不需要再使用这个问号，所以这里直接清掉.
        if seg[i][3] in ["?", "？"]:
            stack["disease"] = []
            stack["disease_desc"] = []

    return res_seg, stack
