from exam_standard.exam_standard_processor.logic.bu_build_work_flow import build_work_flow


def handle_treatment_desc(seg, text, res_seg, i, stack):
    """
    样本来源: data/goldset_1009.json

    示例 1 原文本:
    插管后经肛管注入气体，压力约6－8KPa，见直肠、乙状结肠、降结肠、横结肠、升结肠依次显示，于回盲部可见一小团块状软组织密度影，
    随着气体逐渐退缩，直至软组织影消失，气体进入小肠。

    seg:
    [0, 9, 'treatment', '插管后经肛管注入气体']
    [11, 19, 'treatment_desc', '压力约6－8KPa']

    示例 2 原文本:
    静脉注射显像剂后1-30分钟、60分钟分别行腹部前位显像，1分钟可见肝脏显影，肝影较清晰，轮廓光整。
    30分钟左上腹见散在多发片状放射性浓集影，60分钟见肝脏影慢性减淡，胆囊明显显影，右上腹影增浓并往下腹部移动。

    seg:
    [0, 3, 'treatment', '静脉注射']
    [4, 6, 'treatment_desc', '显像剂']
    [8, 13, 'time', '1-30分钟']
    [15, 18, 'time', '60分钟']
    [22, 23, 'symptom_obj', '腹部']
    [24, 27, 'exam', '前位显像']
    [29, 31, 'time', '1分钟']
    [32, 33, 'reversed_exam_result', '可见']
    [34, 35, 'symptom_obj', '肝脏']
    [36, 37, 'reversed_exam_item', '显影']

    示例 3 原文本:
    检查技术：静脉注射99mTc-EHAID 2mCi后立即连续采集30分钟影像，随后分于2、6、23小时采集静态影像。
    肝胆显像示：静脉注射示踪剂 1分钟即见心、肝、双肾隐约显影，5分钟见膀胱隐约显影。
    肝影较浓，轮廓较清晰，边缘不光整，随时间延长肝影未见明显减淡。心影始终较浓。
    血及软组织本底增高。检查时间内始终未见肝内外胆管、胆囊及肠道显影。

    seg:
    [5, 8, 'treatment', '静脉注射']
    [9, 24, 'treatment_desc', '99mTc-EHAID 2mCi']
    [25, 25, 'time', '后']
    [28, 37, 'exam', '连续采集30分钟影像']
    """

    res_seg, stack = build_work_flow(seg, text, res_seg, i, stack)

    if i < len(seg) - 1:
        if seg[i-1][2] != seg[i][2]:
            stack["treatment"] = []

    return res_seg, stack
