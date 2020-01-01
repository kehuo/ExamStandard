import json
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from exam_standard.exam_standard_processor.exam_standard import ExamStandardProcessor
from exam_standard.exam_standard_processor.utils import load_json_file, save_esp_res_all, save_norm_res_all
from exam_standard.normalization_processor.utils import load_loinc_radlex_data, init_required_datas_for_norm
from exam_standard.normalization_processor.normalizer import Normalizer
import pymysql
pymysql.install_as_MySQLdb()


def exam_standard_func(cfg):
    """
    1 先运行结构化
    """

    # load source data
    source_data = load_json_file(cfg["source_json_file_path"] + cfg["source_json_file_name"])

    # 实例化
    esp = ExamStandardProcessor(cfg["esp_cfg"])

    # run
    res_all = []
    for source_data_one in source_data:
        res_segments = esp.run(source_data_one)
        res_all.append(res_segments)

    # save as json
    save_esp_res_all(source_data, res_all, cfg["result_save_path"], cfg["result_save_name"])

    return res_all


def normalize_func(cfg):
    """
    2 后运行归一化(根据结构化结果进行归一)
    """
    # 1 load standard data (结构化后的数据)
    standard_data = load_json_file(cfg["input_path"] + cfg["input_name"])

    # 2 load 所需的数据(LOINC和Radlex 的标准字典 和 预映射map字典)
    required_data_dict = init_required_datas_for_norm(cfg)

    # 3 实例化 normalize processor, 将2个tree作为 __init__ 参数传入
    # 3.1 db
    job_app = Flask(__name__)
    job_app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://%s:%s@%s:%s/%s" % (
        cfg["db_user"],
        cfg["db_password"],
        cfg["db_host"],
        cfg["db_port"],
        cfg["db_name"]
    )
    job_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    job_db = SQLAlchemy(job_app)
    # 3.2 processor_config.json
    with open(cfg["norm_cfg_path"], "r", encoding="utf-8") as f:
        norm_cfg = json.load(f)
    # 3.3 实例化
    normalizer = Normalizer(db=job_db, required_data_dict=required_data_dict, config=norm_cfg)

    # 4 run
    res_all = []
    for standard_data_one in standard_data:
        res_one = normalizer.run(standard_data_one)
        if len(res_one) > 0:
            res_all.append(res_one)

    # 5 save as json
    save_norm_res_all(res_all, cfg["result_save_path"])
    return
