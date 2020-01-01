import pandas as pd
from requests import post
import json


class KidneyRawExcelProcessor(object):
    """该类用来处理: 最原始的包含 400份肾病理报告的excel文件."""

    def __init__(self, raw_excel_path, param_dict_path):
        # 1 读取原始 excel
        try:
            self.df = pd.read_excel(raw_excel_path)
        except Exception as e:
            self.df = None
        # 2 读取配置文件
        try:
            with open(param_dict_path, "r", encoding="utf-8") as param_f:
                self.param_dict = json.load(param_f)
        except Exception as e:
            self.param_dict = {}
        # 其他
        self.list_data = []
        return

    def _tagging(self, tagging_api_url, text):
        """
        功能函数 - call 标注模型 api
        tagging_api_url: http://172.18.0.61:6308/serve/predict_samples

        如果成功 -> raw_res = list结构
        如果失败 -> raw_res = 字典结构 = {'code': 'FAILURE', 'errMsg': 'Failed to tagging sample', 'id': '1001'}
        """
        # 1 构造请求body
        req_body = {
            "model_version": None,
            "samples": [{"content": text}],
            "model_name": "standard_entity",
            "kwargs": {
                "model": {
                    "type": "exam",
                    # "version": "ver_20191018_141548"
                    "version": "ver_20191225_092047"
                },
                "returnSource": True,
                "serialize": False
            }
        }

        req_body = json.dumps(req_body)

        # 2 发送请求
        target = []
        raw_res = post(tagging_api_url, req_body, headers={'Content-Type': 'application/json'}).json()
        if isinstance(raw_res, list):
            raw_res = raw_res[0]

            # 3 对返回结果做进一步处理(因为返回结果的每一个tag中，没有文字，需要手动拼进去)
            target = [[i[0], i[1], i[2], text[i[0]:i[1] + 1]] for i in raw_res["entity_standard"]]

        return target

    def _is_valid(self, row_one):
        """
        功能函数 - 如果 光镜检查 是乱码， 则标记为无效数据.
        """
        res = True
        if pd.isna(row_one["镜下所见"]):
            res = False
        else:
            if ("CB2897F9F5" in row_one["镜下所见"]) or \
                    ("C848CE5E0DEED7D" in row_one["镜下所见"]) or \
                    ("BF14FDC542B" in row_one["镜下所见"]):
                res = False

        return res

    def _read_excel_to_list(self):
        """
        功能函数 - 将 self.df --> self.list_data

        id - 序号
        valid - 是有效数据 (excel 中没有标红)
        diagnostic_result - 诊断结果
        light_microscopy - 镜下所见
        frozen_macroscopy - 冰冻巨检描述
        """
        self.list_data = []
        for i in range(0, len(self.df)):
            one = self.df.loc[i]
            tmp = {
                "id": int(one["序号"]),
                "valid": "1" if self._is_valid(one) else "0",
                "diagnostic_result_text": one["诊断结果"],
                "light_microscopy_text": one["镜下所见"],
                "frozen_macroscopy_text": one["冰冻巨检描述"]
            }

            self.list_data.append(tmp)

    def write_list_to_json(self, json_path):
        """将 self.list_data 写入 json_path"""
        # 先构造 list_data
        self._read_excel_to_list()

        # 写入
        tagging_api_url = self.param_dict["tagging_model_url"]
        with open(json_path, "a", encoding="utf-8") as json_f:
            for i in self.list_data:
                print("序号:[%s], 有效:%s" % (i["id"], i["valid"]))
                lm_target = self._tagging(tagging_api_url, i["light_microscopy_text"]) if i["valid"] == "1" else []
                dr_result = self._tagging(tagging_api_url, i["diagnostic_result_text"]) if i["valid"] == "1" else []

                tmp = {
                    "id": i["id"],
                    "valid": i["valid"],
                    "input": {"light_microscopy_text": i["light_microscopy_text"],
                              "diagnostic_result_text": i["diagnostic_result_text"],
                              "frozen_macroscopy_text": i["frozen_macroscopy_text"]},
                    "light_microscopy_target": lm_target,
                    "diagnostic_result_target": dr_result
                }

                json_obj = json.dumps(tmp, ensure_ascii=False)
                json_f.write(json_obj + "\n")
        return


def main():
    """
    读原始 400份肾病理报告的 excel -> 生成 goldset.json
    """

    # 1 定义基础路径
    base_path = "/Users/hk/dev/ExamStandard/backend/exam_standard/exam_standard_processor/data/"

    # 2 初始化实例 kep = kidney excel processor, 同时读取 raw_excel
    kep = KidneyRawExcelProcessor(raw_excel_path=base_path + "raw_400_kidney.xlsx",
                                  param_dict_path=base_path + "param.json")

    # 3 写入 goldset.json
    json_result_name = "goldset.json"
    kep.write_list_to_json(base_path + json_result_name)
    return


if __name__ == '__main__':
    main()
