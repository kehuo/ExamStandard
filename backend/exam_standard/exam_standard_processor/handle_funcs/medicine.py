from exam_standard.exam_standard_processor.logic.bu_build_work_flow import build_work_flow


def handle_medicine(seg, text, res_seg, i, stack):
    """
    2019-10-14 讨论:
    1 medicine 和 treatment_desc 标注重复的地方，之后会修改 (示例2);
    2 遇到medicine可以 build_work_flow 拼结果 (示例1)

    示例 1 原文本:
    腹部透视：未见异常密度影。经肛管灌入适量对比剂及适量空气，后摄片见：对比剂通过直肠、乙状结肠、降结肠、横结肠、升结肠顺利。
    所见直肠、乙状结肠、降结肠、横结肠、升结肠，轮廓：光整清楚，肠壁柔软。肠管：粘膜规则，未见狭窄、充盈缺损。
    24小时复查，结肠内仍可见大量对比剂残留。

    seg:
    [14, 17, 'treatment', '肛管灌入']
    [20, 22, 'medicine', '对比剂']


    示例 2 原文本:
    静脉注射显像剂99mTc-EHIDA 2mCi后1-30分钟、1、3、8及24小时分别行腹部前位显像，5分钟可见肝脏显影，肝影较淡，影像欠清晰，轮廓欠光整。
    可见心脏、双肾及膀胱显影，至24小时时肝影仍较浓，始终未见胆道及胆囊显影，但可见腹部肠影隐约显影，血本底较高。

    seg:
    [0, 3, 'treatment', '静脉注射']
    [4, 22, 'medicine', '显像剂99mTc-EHIDA 2mCi']
    [23, 40, 'time', '后1-30分钟、1、3、8及24小时']
    [44, 45, 'symptom_obj', '腹部']
    [46, 49, 'exam', '前位显像']
    [51, 53, 'time', '5分钟']
    [54, 55, 'reversed_exam_result', '可见']
    [56, 57, 'symptom_obj', '肝脏']
    [58, 59, 'reversed_exam_item', '显影']


    示例 3 原文本:
    静脉注射显像剂后1-30分钟、60分钟、90分钟、240分钟分别行腹部前位显像，1分钟可见肝脏显影，肝影较清晰，轮廓欠光整。
    可见心脏、双肾及膀胱显影，至5分钟时心影明显减淡，血本底较高。
    20分钟时胆囊，并时间延长逐渐增浓，肝影逐渐减淡，240分钟时胆囊影减淡，右下腹可见片状放射性浓集影。

    seg:
    [0, 3, 'treatment', '静脉注射']
    [4, 6, 'medicine', '显像剂']
    [7, 7, 'time', '后']
    [33, 34, 'symptom_obj', '腹部']
    [35, 38, 'exam', '前位显像']
    [40, 42, 'time', '1分钟']
    [43, 44, 'reversed_exam_result', '可见']
    [45, 46, 'symptom_obj', '肝脏']
    [47, 48, 'reversed_exam_item', '显影']
    """

    res_seg, stack = build_work_flow(seg, text, res_seg, i, stack)

    return res_seg, stack
