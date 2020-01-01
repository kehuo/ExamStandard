from copy import deepcopy
from exam_standard.exam_standard_processor.utils import connect


def process_raw_norm_res(raw_norm_res):
    """
    功能函数 - 以后有需要的时候, 在这里将 raw_norm_res 处理成前端需要的格式(暂时没有处理的必要)
    输入:
    raw_norm_res = ["id": 0,
                    "loinc": {"super_class": "xxx", "class": "xxx", "system": "xxx", "num": 24876-5},
                    "narrative": "xxxxx(整条原文本text)"
                    "bb_extension": [
                        {"text": "肝光滑",
                         "tags": [[0, 0, obj, 肝], [1, 2, symptom_desc, 光滑]]},
                         "radlex_info": [
                            {"tag": [0, 0, obj, 肝],
                             "cn_name": "肝脏",
                             "radlex_id": RID12345},

                            {"tag": [1, 2, symptom_desc, 光滑],
                             "cn_name": "光滑的",
                             "radlex_id": RID00000
                             }
                         ]
                    ]

    ]
    """
    norm_res = deepcopy(raw_norm_res)

    # 因为有可能归一失败，所以加一个异常处理方式
    if len(norm_res) == 0:
        return norm_res

    for one in norm_res[0]["bb_extension"]:
        one["detailed_text"] = "".join([connect(i) for i in one["tags"]])

    return norm_res

