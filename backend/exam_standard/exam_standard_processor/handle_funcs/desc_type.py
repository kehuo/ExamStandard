def handle_desc_type(seg, text, res_seg, i, stack):
    """
    样本来源 data/goldset_1009.json

    示例 1 原文本:
    右肾大小56×23mm，实质厚8mm，左肾大小56×27mm，实质厚8mm，双肾大小正常，实质与集合系统分界清晰，左肾肾盂分离呈液性暗区，前后径约8mm；
    右肾未见明显异常回声团块。左侧输尿管上段内径2mm，中下段未显示；右侧输尿管未见明显扩张。

    seg:
    [57, 57, 'symptom_pos', '左']
    [58, 62, 'symptom_obj', '肾肾盂分离']
    [64, 67, 'lesion', '液性暗区']
    [69, 71, 'exam_item', '前后径']
    [72, 75, 'exam_result', '约8mm']
    [76, 76, 'desc_type', '；']
    [77, 77, 'symptom_pos', '右']
    [78, 78, 'symptom_obj', '肾']
    [79, 84, 'reversed_exam_result', '未见明显异常']
    [85, 88, 'reversed_exam_item', '回声团块']
    """

    return res_seg, stack
