"""
该文件作用:
给 logic / bu_build_sorted_product_params 函数构造 *args
*args 根据 tag_args_kwargs_map 构造;
branches 字段是指 pos/part/obj

2019-11-20注释
注意:
1 symptom_deco 理论上不应该出现在这里，但是为了处理 desc + deco + desc 的结构，暂时加入. symptom_deco的列表遵循以下3个规律:
a 它build自己之前的desc(因为这种属于reversed特殊结构)，deco + desc是正常结构，会在遇到desc标签时处理.
b 它支持的标签类型，和build desc标签时用的一模一样,也就是说:
tag_args_map["symptom_desc"] = tag_args_map["symptom_deco"]
c 他会使用一个特殊栈: special_pre_desc

2 special_obj_between_desc_and_comma 是一个特殊stack，在symptom_desc + obj + 逗号特殊结构中使用

3 reversed_exam_item 中加入 "treatment", 是因为以下示例报告:
"经导管注入造影剂treatment 直肠obj 依次reversed_exam_result 显影reversed_exam_item。"

4 TODO 2019-11-25注释. 需要确认: symptom在拼结果时，是否需要携带 "pos/obj/part" 这3个表示实体的标签 (目前不拼)
"""


tag_args_map = {
    "exam_result": ["exam", "branches", "exam_item", "exam_result",
                    "lesion", "medical_events", "time", "treatment", "symptom_deco"],

    "reversed_exam_item": ["exam", "branches", "reversed_exam_item", "reversed_exam_result",
                           "lesion", "medical_events", "time", "treatment"],

    "symptom_desc": ["exam", "branches", "symptom_deco", "symptom_desc",
                     "entity_neg", "time", "special_obj_between_desc_and_comma"],

    "symptom_deco": ["special_pre_desc", "exam", "branches", "symptom_deco", "symptom_desc",
                     "entity_neg", "time"],

    "lesion_desc": ["exam", "branches", "entity_neg",
                    "lesion", "lesion_desc", "time"],

    "treatment_desc": ["treatment", "treatment_desc"],

    "lesion": ["exam", "branches", "entity_neg", "exam_item", "exam_result",
               "lesion", "lesion_desc", "time"],

    "symptom": ["branches", "entity_neg", "symptom"],

    "medicine": ["branches", "medicine", "treatment"],

    "entity_neg": ["entity_neg", "branches"],

    "disease_desc": ["disease_desc", "disease"],

    "disease": ["disease", "disease_desc", "entity_neg"]
}


def get_product_params_func_args(tag, stack):
    args = [stack[key] for key in tag_args_map[tag]]

    return args
