from requests import post
import json
import traceback
from db_models.db_models import ReportTaggingSamples
from exam_standard.bu_logic.bu_process_raw_lossless import process_raw_lossless
from exam_standard.bu_logic.bu_process_raw_norm_res import process_raw_norm_res
from common.utils.db import build_one_result


def search_raw_exam_report_by_id(global_var, args):
    """
    流程1 - 通过前端传来的 文本id，从数据库中过滤出对应的文本text
    res = {"content": "双侧肾脏大小正常,..",
           "content_tag": {"entity": {
                                        [0, 1, pos, 双侧],
                                        [2, 3, obj, 肾脏],
                                        ...
                                    }
                        }
            }
    """

    db = global_var["db"]
    res = {}
    try:
        record = db.session.query(ReportTaggingSamples.content, ReportTaggingSamples.content_tag) \
            .filter(ReportTaggingSamples.id == int(args["id"])).first()

        if record:
            items = ["content", "content_tag"]
            res = build_one_result(record, items)

    except Exception as e:
        traceback.print_exc()

    return res


def build_targets_by_tagging_model(global_var, text):
    """
    流程步骤2 - 标注
    tagging_service_api: http://172.18.0.61:6308/serve/predict_samples
    :return: target = [[0, 0, obj, 肝], [1, 2, exam_item, 大小], ...]
    """

    # 1
    tagging_service_api = global_var["tagging_service_api"]

    # 2 构造请求body
    req_body = {
        "model_version": None,
        "samples": [{"content": text}],
        "model_name": "standard_entity",
        "kwargs": {
            "model": {
                "type": "exam",
                "version": "ver_20191018_141548"
            },
            "returnSource": True,
            "serialize": False
        }
    }

    req_body = json.dumps(req_body)

    # 3 发送请求
    raw_res = post(tagging_service_api, req_body, headers={'Content-Type': 'application/json'}).json()[0]

    # 4 对返回结果做进一步处理(因为返回结果的每一个tag中，没有文字，需要手动拼进去)
    target = [[i[0], i[1], i[2], text[i[0]:i[1] + 1]] for i in raw_res["entity_standard"]]

    return target


def build_targets_by_manual(raw_exam_report, text):
    """由于模型还需要优化, 暂时先用已经存储在数据库中的 人工标注 的数据"""
    # text = raw_exam_report["content"]
    raw_target = json.loads(raw_exam_report["content_tag"])
    target = raw_target["entity"]

    res = []
    for i in target:
        i.append(text[i[0]:i[1] + 1])
        res.append(i)

    return res


def build_lossless(global_var, text, target):
    """
    流程步骤3 -- 结构化 lossless
    1 esp = ExamStandardProcessor 类的一个实例化对象, 在init_model时启动
    2 text: 原始检查报告文本
    3 targets: 标注的结果
    注意：这里需要按照 esp 数据的格式，封装一下送入的数据结构source_data.
    source_data = {"input":{"text": "肝大小正常,..."}, "target": [[tag1], [tag2], ...]}
    """

    # 1
    esp = global_var["exam_standard_processor"]

    # 2 封装所需的正确数据结构
    required_params = {"input": {"text": text},
                       "target": target}

    # 3 送入 esp.run, 并构造返回的结果
    raw_lossless = esp.run(required_params)

    # 4 将lossless构造成前端需要的格式
    lossless = process_raw_lossless(raw_lossless)

    return raw_lossless, lossless


def build_norm_result(global_var, text, target, raw_lossless):
    """
    流程步骤4 -- 归一化

    需要根据np所需的数据格式, 封装一个送入的数据结构
    np = Normalizer 类的一个实例化对象, 在init_model时启动
    """

    # 1
    np = global_var["normalizer"]

    # 2 构造np所需参数
    required_params = {"exam_class": "",
                       "text": text,
                       "target": target,
                       "res": raw_lossless}

    # 3 run
    raw_norm_res = np.run(required_params)

    # 4 将 raw_norm_res 构造成前端所需的格式
    norm_res = process_raw_norm_res(raw_norm_res)

    return raw_norm_res, norm_res


def handle_exam_standard_one(args, global_var):
    """
    以上所有函数的主函数
    注意: lossless 就是 结构化的结果
    参数id = args["id"], 字符串类型，需要转换为int
    """

    # 1 从数据库获取 报告文本
    raw_exam_report = search_raw_exam_report_by_id(global_var, args)
    if raw_exam_report == {}:
        res = {
            "code": "FAILURE",
            "message": "id:%s 对应的检查报告不存在" % args["id"]
        }
        return res

    text = raw_exam_report["content"]

    # 2 从数据库获取 标注数据
    target = build_targets_by_manual(raw_exam_report, text)

    # 3 结构化
    raw_lossless, lossless = build_lossless(global_var, text, target)

    # 4 归一化
    # (把lossless中一部分数据，合并到 norm_res里面)
    raw_norm_res, norm_res = build_norm_result(global_var, text, target, raw_lossless)

    # 5 最终结果
    try:
        res = {"code": "SUCCESS",
               "data": {"text": text,
                        "target": target,
                        "lossless": lossless,
                        "normalized": norm_res}
               }

    except Exception as e:
        traceback.print_exc()
        res = {
            "code": "FAILURE",
            "message": "结构化/归一化失败"
        }

    return res
