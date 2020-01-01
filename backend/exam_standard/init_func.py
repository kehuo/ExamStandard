import traceback
from datetime import timedelta
from flask_jwt_extended import JWTManager

from exam_standard.exam_standard_processor.exam_standard import ExamStandardProcessor
from exam_standard.normalization_processor.normalizer import Normalizer
from exam_standard.normalization_processor.utils import init_required_datas_for_norm, load_json


# def init_exam_standard(app, global_var):
#     # 1 初始化 jwt manager
#     try:
#         if isinstance(app.config['JWT_ACCESS_TOKEN_EXPIRES'], int):
#             time = app.config['JWT_ACCESS_TOKEN_EXPIRES']
#             app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=time)
#             global_var['secretKey'] = app.config['SECRET_KEY']
#             jwt = JWTManager(app)
#
#     except Exception as e:
#         traceback.print_exc()
#
#     # 2 初始化启动 结构化类
#     esp = ExamStandardProcessor()
#     global_var["exam_standard_processor"] = esp
#
#     # 3 初始化 norm 类
#     norm_requred_data_dict = init_required_datas_for_norm(global_var)
#     np = Normalizer(norm_requred_data_dict)
#     global_var["normalizer"] = np
#     return


def init_jwt_manager(app, global_var):
    # 初始化 jwt manager
    try:
        if isinstance(app.config['JWT_ACCESS_TOKEN_EXPIRES'], int):
            time = app.config['JWT_ACCESS_TOKEN_EXPIRES']
            app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=time)
            global_var['secretKey'] = app.config['SECRET_KEY']
            jwt = JWTManager(app)

    except Exception as e:
        print(str(e))

    return


def init_exam_standard_processor(app, global_var):
    # 1 先读取配置文件的路径
    config_path = global_var["esp_cfg_path"]
    # 2 load 配置文件
    config = load_json(config_path)
    # 3 初始化 结构化类
    esp = ExamStandardProcessor(config=config)
    global_var["exam_standard_processor"] = esp

    return


def init_normalization_processor(app, global_var):
    # 1 先读取配置文件的路径
    config_path = global_var["norm_cfg_path"]
    # 2 load 配置文件
    config = load_json(config_path)
    # 3 读取所需json data
    norm_requred_data_dict = init_required_datas_for_norm(global_var)
    # 4 初始化 norm 类
    np = Normalizer(db=global_var["db"],
                    required_data_dict=norm_requred_data_dict,
                    config=config)
    global_var["normalizer"] = np

    return
