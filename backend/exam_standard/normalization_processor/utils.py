import json
import traceback


def load_json(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        json_data = json.load(f)
    return json_data


def restore_tag_one(s):
    """
    2019-11-25 注释: 将特殊符号 * 改为 @ (因为有些检查报告原文本中会有 1*2*3 cm 这种写法)
    同时修改的地方还有:
    exam_standard_processor/utils.py/connect 函数
    demo/kidney_utils.py/getPartContent 函数
    demo/pack_utils.py/getSegPartType 函数

    功能函数 - 还原tag
    输入:
    s: "#4$4&symptom_pos@双^#5$6&symptom_obj@肾区^"
    输出:
    res = [[4, 4, "symptom_pos", "双"], [5, 6, "symptom_obj", "肾区"]]
    """

    res = []
    special_chars = ["#", "$", "&", "@", "^"]

    tmp = []
    idx_1 = idx_2 = idx_3 = idx_4 = 0
    for i in range(len(s)):
        if s[i] == special_chars[0]:
            idx_1 = i
        elif s[i] == special_chars[1]:
            idx_2 = i
            tmp.append(s[idx_1 + 1:idx_2])
        elif s[i] == special_chars[2]:
            idx_3 = i
            tmp.append(s[idx_2 + 1:idx_3])
        # 2019-11-25更新: 这里将 * 改成 @
        elif s[i] == special_chars[3]:
            idx_4 = i
            tmp.append(s[idx_3 + 1:idx_4])
        elif s[i] == special_chars[4]:
            idx_5 = i
            tmp.append(s[idx_4 + 1:idx_5])

            res.append(tmp)
            tmp = []

    return res


def save_norm_res_all_to_json(norm_res_all_data, norm_res_all_path):
    """
    功能函数 - 用来存储归一化的结果
    """
    with open(norm_res_all_path, "w", encoding="utf-8") as f:
        for i in norm_res_all_data:
            i_obj = json.dumps(i, ensure_ascii=False)
            f.write(i_obj + "\n")
    return


def load_loinc_radlex_data(abs_file_path):
    tree_res = {}
    try:
        with open(abs_file_path, "r", encoding="utf-8") as tree_f:
            tree_res = json.load(tree_f)
    except Exception as e:
        print("在normalization_processor/utils.py中, 初始化数据失败: %s" % abs_file_path)
        print("错误: %s" % traceback.format_exc())
    return tree_res


def init_required_datas_for_norm(global_var):
    """
    根据global_var的 normalizer_init_data_list 参数，在norm归一化之前，将所需的数据都初始化好. 初始化的数据一般是:
    loinc_tree
    radlex_tree
    loinc_obj_map: LOINC预映射字典
    radlex_cn_name_map: RadLex预映射字典
    loinc_norm_map
    """

    init_data_list = global_var["normalizer_init_data_list"].split(",")
    path = global_var["norm_data_path"]
    required_datas = dict()
    for data_name in init_data_list:
        required_datas[data_name] = load_loinc_radlex_data(path + data_name + ".json")
    return required_datas
