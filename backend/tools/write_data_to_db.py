import traceback


def write_data_db(device_type):
    """
    功能函数 - 当在一台新机器部署该服务时， 如果该机器连接的数据库中没有相关的数据, 那么需要运行该程序, 将所需的数据写入mysql

    所需数据:
    1 backend/exam_standard/normalization_processor/data/ 下所有json文件
        1.1 loinc_tree.json
        1.2 radlex_tree.json
        1.3 kidney_tree.json

        1.4 kidney_cn_name_map.json
        1.5 loinc_norm_map_step_0.json
        1.6 loinc_obj_map.json
        1.7 radlex_cn_name_map.json

    """
    is_success = True
    try:
        pass
    except Exception as e:
        print("将程序所需的 json 数据写入db时失败:\n%s" % traceback.format_exc())
    return is_success
