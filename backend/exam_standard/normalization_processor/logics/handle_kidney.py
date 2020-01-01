import traceback
import json
from exam_standard.normalization_processor.utils import restore_tag_one
from db_models.db_models import Kidney, KidneyNameMapping


def process_raw_cn_name(db, curr_tag, kidney_cn_name_map):
    """
    功能函数 的 子功能函数 -- 用预映射字典 kidney_cn_name_map, 将 raw_cn_name 值规范化
    在 build_kidney_res 函数中被调用
    如: 将raw_obj"肝" 规范为 processed_obj"肝脏"
    """

    raw_cn_name = curr_tag[3]
    raw_tag_type = curr_tag[2]

    # 201-12-23 json 文件映射
    # # 1 先用 tag_type(如 symptom_desc / object_part), 在 map 中做 level_1 映射, 得到2级map: sub_map
    # sub_map = kidney_cn_name_map[raw_tag_type] if raw_tag_type in kidney_cn_name_map.keys() else None
    #
    # # 如果 sub_map 存在, 则在里面通过 raw_cn_name 进行 level_2 映射
    # level_2_res = None
    # if sub_map:
    #     level_2_res = sub_map[raw_cn_name]["cn_name"] if raw_cn_name in sub_map.keys() else None
    #
    # res = level_2_res if level_2_res is not None else raw_cn_name

    # db 映射
    res = raw_cn_name
    try:
        record = db.session.query(KidneyNameMapping) \
            .filter(KidneyNameMapping.tag_type == raw_tag_type) \
            .filter(KidneyNameMapping.src == raw_cn_name) \
            .first()

        if record:
            res = json.loads(record.dst)["cn_name"]
    except Exception as e:
        print("kidney cn name map failed: %s" % traceback.format_exc())

    return res


def recursively_search(data, tag_value):
    """
    功能函数 1 的 子功能函数 - 递归搜索 kidney tree, 找到tag可以对应的所有的项
    在 search_kidney_id 函数中被调用
    """

    if tag_value == data["cn_name"]:
        return data
    else:
        if "children" not in data.keys():
            return None
        else:
            for j in data["children"]:
                if recursively_search(j, tag_value) is not None:
                    return recursively_search(j, tag_value)


def search_kidney_id(db, kidney_tree, tag):
    """
    功能函数 1 - 输入 cn_name, 搜索 kidney id
    """
    # 2019-12-23 json文件搜索
    # res = []
    # for i in kidney_tree["children"]:
    #     each_res = recursively_search(i, tag)
    #     if each_res is not None:
    #         res.append(each_res)

    # db 搜索
    res = []
    record = db.session.query(Kidney).filter(Kidney.cn_name == tag).first()
    if record:
        res.append(
            {"cn_name": record.cn_name,
             "en_name": record.en_name,
             # 注意 parent_kid 要有方括号, 保持和 kidney tree 数据格式统一.
             "parents": [record.parent_kid],
             "kid": record.kid}
        )
    return res


def build_text_and_tags(data):
    """
    功能函数 2 - 主函数中被调用，用于构造最终返回的数据

    输入:
    data = ['#35$37&symptom_obj@肾小球^#38$41&object_part@系膜细胞^',
            '#45$46&symptom_deco@弥漫^',
            '#47$50&symptom_desc@中度增生^']

    返回:
    text = "肾小球系膜细胞弥漫中度增生"
    restored_tag_list = [['35', '37', 'symptom_obj', '肾小球'],
                         ['38', '41', 'object_part', '系膜细胞'],
                         ['45', '46', 'symptom_deco', '弥漫'],
                         ['47', '50', 'symptom_desc', '中度增生']
                        ]
    """
    restored_tag_list = []
    for i in data:
        restored_tag_list.extend(restore_tag_one(i))
    text = "".join([i[3] for i in restored_tag_list])

    return text, restored_tag_list


def is_numerical_tag(a_string):
    """
    如果一个字符串中有 任何数字，则返回True
    :param a_string: "12x22mm"
    :return: True
    ord("0") = 48
    ord("9") = 57
    """
    res = False
    start, end = ord("0"), ord("9")
    for char in a_string:
        if ord(char) in range(start, end):
            res = True
            break
    return res


def build_kidney_res(db, kidney_tree, tags, kidney_cn_name_map):
    """
    功能函数 3 - 主函数中被调用，构造返回结果
    """
    res = []
    for tag_one in tags:
        # 1 预映射 先将每一个 tag_one 规范化
        cn_name = process_raw_cn_name(db=db,
                                      curr_tag=tag_one,
                                      kidney_cn_name_map=kidney_cn_name_map)

        # 2 数值型结果如 "11x22mm", "123mg/C", "6min后" 等结果，分2种情况
        if is_numerical_tag(cn_name):
            # <1> 是time类型的tag --> 归到 "时间描述符" 下
            if tag_one[2] == "time":
                kidney_res_one = [
                    {"cn_name": "时间描述符",
                     "en_name": "temporal descriptor",
                     "parents": "KID1",
                     "kid": "KID9998"
                     }
                ]

            # <2> 不是time类型 --> 先归一到自定义的特殊 bb_radlex_id 下，之后再完善数值归一方式
            else:
                kidney_res_one = [
                    {"cn_name": "数值型描述或结果",
                     "en_name": "bb numerical description or result",
                     "parents": "KID1",
                     "kid": "KID9999"
                     }
                ]

        # 3 再用规范后的 cn_name 去 kidney tree 中归一
        else:
            kidney_res_one = search_kidney_id(db, kidney_tree, cn_name)

        # 如果归一成功, 则放入res
        if len(kidney_res_one) > 0:
            res.append(
                {"tag": tag_one,
                 "cn_name": kidney_res_one[0]["cn_name"],
                 "radlex_id": [i["kid"] for i in kidney_res_one]}
                # "kidney_id": [i["kid"] for i in kidney_res_one]}
            )

    return res


def handle_kidney(db, standard_data, norm_tree, tree_cn_name_map):
    """
    主函数 - 处理 "肾病理报告" 归一
    """
    # 构造res
    res = []
    for data in standard_data["res"]:
        # 1 text 和 tags
        text, tags = build_text_and_tags(data)

        # 2 kidney_info
        kidney_info = build_kidney_res(db, norm_tree, tags, tree_cn_name_map)
        # 3 构造结果
        tmp = {
            "text": text,
            "tags": tags,
            "radlex_info": kidney_info
            # "kidney_info": kidney_info
        }
        # 4 放入res
        res.append(tmp)

    return res
