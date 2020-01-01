from exam_standard.exam_standard_processor.utils import connect

from exam_standard.exam_standard_processor.handle_funcs.symptom_obj import handle_symptom_obj
from exam_standard.exam_standard_processor.handle_funcs.symptom_pos import handle_symptom_pos
from exam_standard.exam_standard_processor.handle_funcs.object_part import handle_object_part

from exam_standard.exam_standard_processor.handle_funcs.exam_item import handle_exam_item
from exam_standard.exam_standard_processor.handle_funcs.exam_result import handle_exam_result

from exam_standard.exam_standard_processor.handle_funcs.lesion import handle_lesion
from exam_standard.exam_standard_processor.handle_funcs.lesion_desc import handle_lesion_desc

from exam_standard.exam_standard_processor.handle_funcs.symptom_deco import handle_symptom_deco
from exam_standard.exam_standard_processor.handle_funcs.symptom_desc import handle_symptom_desc

from exam_standard.exam_standard_processor.handle_funcs.reversed_exam_result import handle_reversed_exam_result
from exam_standard.exam_standard_processor.handle_funcs.reversed_exam_item import handle_reversed_exam_item

from exam_standard.exam_standard_processor.handle_funcs.treatment_desc import handle_treatment_desc

from exam_standard.exam_standard_processor.handle_funcs.exam import handle_exam

from exam_standard.exam_standard_processor.handle_funcs.symptom import handle_symptom
from exam_standard.exam_standard_processor.handle_funcs.medicine import handle_medicine
from exam_standard.exam_standard_processor.handle_funcs.entity_neg import handle_entity_neg

from exam_standard.exam_standard_processor.handle_funcs.disease import handle_disease
from exam_standard.exam_standard_processor.handle_funcs.disease_desc import handle_disease_desc
from exam_standard.exam_standard_processor.handle_funcs.vector_seg import handle_vector_seg

"""
1 build_work_flow的函数:
exam_result
reversed_exam_item
lesion
lesion_desc
symptom_desc
treatment_desc


2 只出入栈 (包含逻辑判断):
pos
obj
object_part
exam_item
reversed_exam_result
symptom_deco
exam


3 出入栈（不包含逻辑判断）
treatment
medical_events
time
symptom
medicine


4 暂不做任何处理
pathogen
vector_seg
desc_type
"""


def handle_push_stack_only(seg, text, res_seg, i, stack):
    stack[seg[i][2]] = [connect(seg[i])]

    return res_seg, stack


def handle_none(seg, text, res_seg, i, stack):

    return res_seg, stack


handle_func_map = {
    "symptom_pos": handle_symptom_pos,
    "symptom_obj": handle_symptom_obj,
    "object_part": handle_object_part,

    "exam_item": handle_exam_item,
    "exam_result": handle_exam_result,

    "lesion": handle_lesion,
    "lesion_desc": handle_lesion_desc,

    "symptom_deco": handle_symptom_deco,
    "symptom_desc": handle_symptom_desc,

    "reversed_exam_result": handle_reversed_exam_result,
    "reversed_exam_item": handle_reversed_exam_item,

    "treatment": handle_push_stack_only,  # 入栈
    "treatment_desc": handle_treatment_desc,

    "exam": handle_exam,

    "medical_events": handle_push_stack_only,  # 入栈
    "time": handle_push_stack_only,  # 入栈
    "entity_neg": handle_entity_neg,  # 入栈

    "vector_seg": handle_vector_seg,  # 暂不作处理
    "pathogen": handle_none,  # 暂不作处理

    "symptom": handle_symptom,
    "medicine": handle_medicine,
    "desc_type": handle_none,  # 暂不作处理,
    "none": handle_none,

    "disease": handle_disease,  # 新添加，后续增加处理方式
    "disease_desc": handle_disease_desc,

    # cont 不做实际处理
    "cont": handle_none
}


def process_seg_one(seg, text, stack):
    """
    :param seg: 示例:
    seg = [
        [26, 26, 'symptom_pos', '左'],
        [27, 27, 'symptom_obj', '肾'],
        [28, 29, 'exam_item', '轮廓'],
        [30, 32, 'exam_result', '欠清晰']
    ]
    :param text: 示例:
    text = "腹主动脉清晰显影后2″右肾清晰显影，左肾轮廓欠清晰。肾血流灌注曲线示双肾灌注峰同时到达，左肾峰值较右肾略低。"
    :param stack: 示例:
    stack = {
        "exam_item": [..],
        "exam_result": [..],
        "ppo_stack": [..],
        ...
    }
    :return: res_seg: 示例:
    res_seg = [
                [
                    "#19$19&symptom_pos@右^#20$20&symptom_obj@肾^",
                    "#21$22&reversed_exam_result@清晰^",
                    "#14$15&reversed_exam_item*显影^"
                ],
                [
                    "#52$52&symptom_pos@左^#53$53&symptom_obj@肾^",
                    "#54$55&exam_item@峰值^",
                    "#56$60&exam_result@较右肾略低^"
                ]
    ]
    """
    res_seg = []

    for i in range(len(seg)):
        tag_type = seg[i][2]

        res_seg, stack = handle_func_map[tag_type](seg, text, res_seg, i, stack)

    return res_seg
