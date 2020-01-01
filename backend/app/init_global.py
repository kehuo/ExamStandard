import sys
from model_init_config import global_init_func_dict
from app.init_db_func import init_db

global_var = {}


def init_global(app):
    global global_var

    global_var['version'] = app.config['VERSION']
    global_var['description'] = app.config['SERVICE_DESC']
    global_var['service'] = app.config['SERVICE_NAME']
    global_var['models'] = app.config['MODELS'].split(',')

    global_var["norm_data_path"] = app.config["NORM_DATA_PATH"]
    global_var["normalizer_init_data_list"] = app.config["NORMALIZER_INIT_DATA_LIST"]
    # 标注服务的api接口
    global_var["tagging_service_api"] = app.config["TAGGING_SERVICE_API"]

    # 2个processor初始化时需要传入的配置文件的路径
    global_var["esp_cfg_path"] = app.config["ESP_CFG_PATH"]
    global_var["norm_cfg_path"] = app.config["NORM_CFG_PATH"]

    # 把exam_standard 所需的初始化函数加入到 init_func_list 中
    init_func_list = list()

    # 1 先放入 init_db
    init_func_list.append(init_db)

    # 2 再放其他的
    for model in global_var["models"]:
        model = model.strip()
        func = global_init_func_dict.get(model, None)
        if func is None:
            continue

        init_func_list.extend(func)

    # 逐个运行 init_func_list 中的每个函数
    for func in init_func_list:
        try:
            func(app, global_var)
        except Exception as e:
            print("init_func_list失败, 错误信息:\n%s" % str(e))
            sys.exit(0)

    return
