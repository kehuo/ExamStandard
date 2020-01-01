from exam_standard.exam_standard_processor.logic.bu_build_work_flow import build_work_flow


def handle_symptom(seg, text, res_seg, i, stack):
    """
    2019-10-14 讨论: 1 遇到 symtpom 后可以build_work_flow 拼接; 2 示例1中的标注symptom不太正确，之后会修改

    示例 1 原文本:
    腹部透视：未见异常密度影。经肛管灌入适量对比剂及适量空气，
    后摄片见：对比剂通过直肠、乙状结肠、降结肠、横结肠、升结肠顺利。
    所见直肠、乙状结肠、降结肠、横结肠、升结肠，轮廓：光整清楚，肠壁柔软。肠管：粘膜规则，未见狭窄、充盈缺损。
    24小时复查，结肠内仍可见大量对比剂残留。

    seg:
    [29, 31, 'exam', '后摄片']
    [34, 38, 'symptom', '对比剂通过']
    [39, 40, 'symptom_obj', '直肠']
    [42, 45, 'symptom_obj', '乙状结肠']
    [47, 49, 'symptom_obj', '降结肠']
    [51, 53, 'symptom_obj', '横结肠']
    [55, 57, 'symptom_obj', '升结肠']
    [58, 59, 'symptom_deco', '顺利']


    示例 2 原文本:
    胃肠道准备不佳，影响观察：肝脏形态、大小未见明显异常，边缘光滑，肝叶比例未见明显异常，肝实质未见明显异常密度影，门静脉未见明显异常。
    胆囊显影，未见明显异常密度影，壁薄，肝内外胆管未见明显扩张。胰腺形态结构清晰，未见明显异常密度影，胰管未见扩张。脾脏不大，密度均匀。
    双肾、双肾上腺未见异常。右侧输尿管略扩张，其内未见明显异常密度影。膀胱充盈良好，膀胱内未见明显异常密度，膀胱壁未见增厚。
    子宫及附件大小、形态正常，未见明显异常密度影。右侧髂窝处多个高密度小结节，腹膜后未见明显肿大淋巴结。未见腹水征。

    seg:
    [242, 243, 'entity_neg', '未见']
    [244, 246, 'symptom', '腹水征']
    """

    res_seg, stack = build_work_flow(seg, text, res_seg, i, stack)

    if i < len(seg) - 1:
        if seg[i+1][2] != seg[i][2]:
            stack["entity_neg"] = []

    return res_seg, stack
