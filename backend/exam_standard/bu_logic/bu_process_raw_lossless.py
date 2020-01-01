from exam_standard.normalization_processor.utils import restore_tag_one


def process_raw_lossless(raw_lossless):
    """
    功能函数 - 将esp处理的结构化数据，进一步处理成前端能展示的格式

    输入:
    raw_lossless = [
        ["#0$1&symptom_pos*双侧^#2$5&symptom_obj*大脑半球^",
         "#18$19&exam_item*对比^",
         "#20$21&exam_result*良好^"
        ],
        [...],
        ...
    ]

    输出：
    lossless = [
        {"misc": {"deco": [], "tags": [], "timex3": []},
         "normalization": 0,
         "source": "default",
         "text": "肝大小正常",
         "time": xxxx,
         "type": "exam_item",
         "value": xxx}，
         {...},
         ...
    ]

    """

    lossless = []
    type_list = ["exam_item", "reversed_exam_item"]
    value_list = ["exam_result", "reversed_exam_result", "symptom_desc"]

    for one in raw_lossless:
        tmp = {
            "misc": {"deco": [], "tags": [], "timex3": []},
            "normalization": 0,
            "source": "default",
            "text": "",
            # detailed_text 格式: "#0$1&symptom_obj*食管^#3$4&object_part*光滑^"
            "detailed_text": "".join(one),
            "type": "",
            "value": ""
        }

        # 处理 tags 字段
        for i in one:
            tmp["misc"]["tags"].extend(restore_tag_one(i))

        # 处理 text 字段
        tmp["text"] = "".join([tag[3] for tag in tmp["misc"]["tags"]])

        # 处理 type 字段, type = "exam_item" / "symptom"
        for tag in tmp["misc"]["tags"]:
            if tag[2] in type_list:
                tmp["type"] = tag[2]
                break
            tmp["type"] = "symptom"

        # 处理 value 字段
        for tag in tmp["misc"]["tags"]:
            if tag[2] in value_list:
                tmp["value"] = tag[3]

        lossless.append(tmp)

    return lossless
