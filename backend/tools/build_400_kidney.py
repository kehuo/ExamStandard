import json
import traceback
import pandas as pd
import re
from collections import Counter, OrderedDict


class Utils(object):
    @staticmethod
    def restore_obj_part_pos(tag):
        """
        输入 = "#35$37&symptom_obj@肾小球^#38$41&object_part@系膜细胞^"
        输出
        """
        return

    @staticmethod
    def load_json(json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data

    @staticmethod
    def write_part_to_frozen_excel_res(item_list, case_judge_dict, frozen_excel_res, idx):
        """
        item_list: ["IgA", "IgG", ...]
        case_judge_dict: {'部位': {'无': 0, '系膜区': 0, '毛细血管袢': 1}, '其他': {'肾小管': 0, '血管': 0}}
        idx: split_one_row 的 idx
        """
        _map = {
            "部位": {
                "无": "0",
                "系膜区": "1",
                "毛细血管袢": "2"
            },
            "其他": {
                "肾小管": "1",
                "血管": "2"
            }
        }

        for _k, _v in case_judge_dict.items():
            _count = Counter(list(_v.values()))

            if _count[1] == 0:
                # 没有需要写入的值
                continue

            # 0 / 1 / 2
            if _count[1] == 1:
                # 找到值为1的那一项, 写入res
                _lucky = None
                for _k2, _v2 in _v.items():
                    if _v2 == 1:
                        _lucky = _k2
                        break

                if _lucky:
                    frozen_excel_res[_k][item_list[idx]] = _map[_k][_lucky]
            # 3
            elif _count[1] > 1:
                frozen_excel_res[_k][item_list[idx]] = "3"

        return frozen_excel_res

    @staticmethod
    def build_case_judge_dict(_split_one_row, _part_map, _idx):
        """
        功能函数 - 对每一个值 ["Ms", "Cap"], 进行统计，以便后续能确认是将该值归到"部位" 还是 "其他"
        :param _split_one_row: [["Ms"], ["MS", "Cap袢", ["Ms", "血管"]]
        :param _part_map:  参考 param.json
        :param _idx: _split_one_row 的索引

        :return
        _case_judge_dict = {'部位': {'无': 0, '系膜区': 1, '毛细血管袢': 1}, '其他': {'肾小管': 0, '血管': 1}}
        """
        _case_judge_dict = {
            "部位": {
                "无": 0,
                "系膜区": 0,
                "毛细血管袢": 0
            },
            "其他": {
                "肾小管": 0,
                "血管": 0
            }
        }

        # _val = ['Ms区', 'Cap袢']
        _val = _split_one_row[_idx]
        _val_count = 0
        # _val_one = "Ms区"
        for _val_one in _val:
            # 特殊情况 -- "无" 先按照 部位 处理, 之后如果有规则变化, 在这里修改
            if _val_one == "无":
                _case_judge_dict["部位"]["无"] += 1
                break
            # _k = "部位" / "其他"
            # _v = {"系膜区": [], "毛细血管袢": []}
            for _k, _v in _part_map.items():
                # _k_2 = "系膜区", _v_2 = ["Ms区", "MS"]
                for _k_2, _v_2 in _v.items():
                    if _val_one in _v_2:
                        _case_judge_dict[_k][_k_2] += 1
        return _case_judge_dict


class KidneyStandardExcelBuilder(object):
    """该类的输入是 lossless.json, 生成结构化好的 data frame -> 写入df.xlsx"""

    def __init__(self, param_dict_path):
        # 1
        self.lossless_list = []
        self.df_data = None
        self.NOT_CHECK = "未查"
        self.NO_VALUE = "无"
        # 2 读取配置文件
        try:
            with open(param_dict_path, "r", encoding="utf-8") as param_f:
                self.param_dict = json.load(param_f)
        except Exception as e:
            self.param_dict = {}
        return

    def read_raw_data(self, raw_data_path):
        """输入lossless.json文件路径 -> 读取所有行到 self.lossless_list"""
        result = []
        with open(raw_data_path, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    dic = json.loads(line)
                    result.append(dic)
                except Exception as e:
                    print("error line: {}".format(line))

        self.lossless_list = result
        return

    def _is_item_row(self, one_line):
        """
        功能函数 - 用来检测 "冰冻巨检描述" 初始文本中 列出所有检查项的那一行文本.

        :param one_line = ["IgA", "IgG", "IgM", "C1q", "C3", "Fib", "HBcAg", "HBsAg", "Kappa", "Lambda"]
        """
        res = False
        for each in self.param_dict["frozen_items"]:
            if each in one_line:
                res = True
                break
        return res

    def init_df_data(self, show=True):
        """
        初始化df_data 所需的列
        1 通用列. 序号 / 有效数据 / 诊断结果 / 镜下所见 / 冰冻巨检描述
        2 将冰冻巨检描述拆成 很多列. 所需参数 - frozen_dims / frozen_items
        3 将诊断结果拆成很多列, 每列一个疾病. 所需参数 - clustered_disease_dict
        4 将 诊断结果 的分型 拆成多列. 所需参数 - disease_tying_list: 分型列表
        """

        df_data = OrderedDict()
        # 1 通用
        common_cols = ["序号", "有效数据", "免疫荧光", "诊断结果", "镜下所见", "冰冻巨检描述"]
        for one in common_cols:
            df_data[one] = []

        # 2 冰冻巨检描述
        for dim in self.param_dict["frozen_dims"]:
            for i in self.param_dict["frozen_items"]:
                df_data[i + dim] = []

        # 3 检查结果
        for k, v in self.param_dict["clustered_disease_dict"].items():
            df_data[k] = []

        # 分型的列 (局灶增生型 / 牛津分型 / ...)
        for typing in self.param_dict["disease_tying_list"]:
            df_data[typing] = []

        if show:
            print("\n初始化的df_data, 共%d个key" % len(df_data.keys()))
            for i in df_data.keys():
                print(i)
            print("")

        self.df_data = df_data
        return

    def _init_frozen_excel_res(self, show=True):
        """
        初始化 冰冻巨检描述 统计结果的字典

        注意 "无" 和 "未查" 的区别:
        1 如果该报告的检查项有3个: IgA / IgM / Fib, 并且:
        强度 = ["+", "-", "++"]
        部位 = ["血管袢", "无", "血管袢"]
        形态 = ["颗粒", "无", "颗粒"]
        分布 = ["节段", "无", "节段"]

        那么返回结果:
        frozen_excel_res = {
            "免疫荧光": "8G",
            "强度": {"IgA": "+", "IgM": "无", "Fib": "++", "C3": "/", "HBsAg": "/", ...},
            "部位": {"IgA": "血管袢", "IgM": "无", "Fib": "血管袢", "C3": "/", "HBsAg": "/", ...},
            "形态": {"IgA": "颗粒", "IgM": "无", "Fib": "颗粒", "C3": "/", "HBsAg": "/", ...},
            "分布": {"IgA": "节段", "IgM": "无", "Fib": "节段", "C3": "/", "HBsAg": "/", ...},
        }

        如果某个检查项（比如Fib） item_list 中, 但是在"分布"或者"强度"维度中，没有检查值，那么这种是 "无";
        如果某个检查项（比如C3）不在 item_list 中，那么这种是 "未查"

        item_list 可以在 build_frozen_excel_columns 中查看

        一共有 16 种检查项 - IgA, IgM, Fib, ...

        2019-12-27 周五 会议后注释:
        "分布"的默认值不是 "未查", 而是 "球性"
        """
        frozen_excel_res = dict()
        frozen_excel_res["免疫荧光"] = self.NOT_CHECK

        # 共4个 dim_one
        for dim_one in self.param_dict["frozen_dims"]:
            # 共 16 个 i
            for i in self.param_dict["frozen_items"]:
                # 新的key, 比如 "强度" = {}
                if dim_one not in frozen_excel_res.keys():
                    frozen_excel_res[dim_one] = {}
                # 2019-12-27 "分布"的默认值是"球性", 而不是"未查"
                if dim_one == "分布":
                    frozen_excel_res[dim_one][i] = "球性"
                elif dim_one != "分布":
                    if (dim_one == "部位") or dim_one == "其他":
                        frozen_excel_res[dim_one][i] = "/"
                    else:
                        frozen_excel_res[dim_one][i] = self.NOT_CHECK

        if show:
            print("\n初始化好的frozen_excel_res:")
            for k, v in frozen_excel_res.items():
                print(k, v)
            print("\n")

        return frozen_excel_res

    def _init_diagnostic_result_excel_res(self, show=True):
        """
        初始化 诊断结果 统计的字典

        先全部置0， 之后统计时，将命中的项置1
        """
        diagnostic_result_excel_res = dict()

        for k, v in self.param_dict["clustered_disease_dict"].items():
            diagnostic_result_excel_res[k] = 0

        if show:
            print("初始化好的疾病字典:")
            for k, v in diagnostic_result_excel_res.items():
                print(k, v)
            print("\n")

        return diagnostic_result_excel_res

    def _init_disease_typing_excel_res(self, show=True):
        """初始化 牛津分型 等分型的字典"""
        disease_typing_excel_res = dict()

        for i in self.param_dict["disease_tying_list"]:
            disease_typing_excel_res[i] = self.NOT_CHECK

        if show:
            print("初始化好的分型字典:")
            for k, v in disease_typing_excel_res.items():
                print(k, v)
            print("\n")

        return disease_typing_excel_res

    def _build_frozen_list(self, raw_frozen_str, show=True):
        """
        返回:
            ["免疫荧光:8G"]
            ["IgA", "IgG", "IgM", "C1q", "C3", "Fib", "HBcAg", "HBsAg"]
            ["强度:+-++", "++++", "++", "++", "++", "++", "-", "-"]
            ["部位:Cap", "Cap", "Cap+Ms", "Cap", "Cap", "Cap"]
            ["形态:颗粒", "颗粒", "颗粒", "颗粒", "颗粒", "颗粒"]
        """
        # 1 原始str -> 原始列表
        raw_frozen_list = [i.split(" ") for i in raw_frozen_str.split("\n")]

        # 去掉 "\r" 符号
        if len(raw_frozen_list) > 0:
            # one = ["IgA", "IgG", "IgM", "C1q", "C3", "Fib", "HBcAg", "HBsAg"]
            for one in raw_frozen_list:
                for idx in range(0, len(one)):
                    # char = "IgA/r"
                    char = one[idx]
                    if "\r" in char:
                        x = char.index("\r")
                        # 处理后 char = "IgA"
                        char = char[:x] + char[x + 1:]
                        one[idx] = char

        # 2 对原始列表去空值
        frozen_list = []
        for i in raw_frozen_list:
            tmp = []
            for j in i:
                if j != "":
                    tmp.append(j)
            frozen_list.append(tmp)

        if show:
            print("统计的frozen_list:")
            for i in frozen_list:
                print(i)
            print("\n")

        return frozen_list

    def _build_frozen_excel_columns(self, frozen_excel_res, frozen_list):
        """
        功能函数 - 将 冰冻巨检描述 的一段字符串，格式化成多列数据.
        参数:
        frozen_dims = 一个列表， 有5个维度 ["强度", "部位", "形态", "分布", "其他"]
        frozen_items - 一个列表，有16个所有检查项, [IgA, IgG, ...]

        注意:
        minus_idx_list:  这个列表记录item_list列表中, 强度值为 "-" 的索引值.
        如果一个强度值是 "-"， 那么对应的部位/形态/分布 都填充为 "无"(NO_VALUE)

        返回结果:
        frozen_excel_res =
        {
            "免疫荧光": "8G",

            "IgA强度": "",
            "IgG强度": "",
            "IgM强度": "",
            ...

            "IgA部位": "",
            ...

            "IgA形态": "",
            ...

            "IgA其他": "",
            ...
        }
        """

        def __move_word_from_one(_one):
            """
            把
                强度： / 部位： / 形态： / 分布：
            这些字样从one中删掉 """
            colon_idx = _one[0].index(":") if ":" in _one[0] else _one[0].index("：")
            _one[0] = _one[0][colon_idx + 1:].rstrip().lstrip()
            return _one

        def __build_minus_idx_list(_one, _minus_idx_list):
            """该函数只在 强度 行被调用 -- 强度值为"-" 的项的索引，将被写入 minus_idx_list. """
            for intensity_idx in range(0, len(_one)):
                if _one[intensity_idx] == "-":
                    _minus_idx_list.append(intensity_idx)
            return _minus_idx_list

        def __fill_one_based_on_minus_idx_list(_one, _minus_idx_list):
            """根据minus_idx_list, 填充one"""
            for minus_idx in _minus_idx_list:
                _one.insert(minus_idx, self.NO_VALUE)
            return _one

        def __write(_frozen_excel_res, _item_list, _one_row, _row_type, **kwargs):
            """
            写入frozen_excel_res.
            row_type = 强度 / 部位 / 形态 / 分布 / 其他

            2019-12-27 与黄博士电话会议后注释
            *** 由于原始数据中, 会将 ["部位", "其他"] 2个 dim, 都写到 "部位"这一行中, 所以,
            "部位"这个row_type较特殊，要处理 2个dim, 单独在 if row_type == "部位" 中处理.

            "部位"中:
            "MS", "系膜", "Cap", "毛细血管袢", "血管袢" 等属于 "部位"
            "血管" / "肾小管" / "肾小管"+"血管" 属于 "其他"

            参数:
            _item_list = ['IgA', 'IgG', 'IgM', 'C1q', 'C3', 'Fib', 'HBcAg']
            _one_row = ['Ms区及Cap袢', 'Ms区及Cap袢', 'Ms区及Cap袢', 'Ms区及Cap袢', 'Ms区及Cap袢', '无', 'Ms区及Cap袢']
            _part_map: 默认为None, 只有row_type="部位"的时候才会传入这个参数, 即self.param_dict["new_part_map"]
            _row_type = "部位"

            _frozen_excel_res = {
                '免疫荧光': '8G',
                '强度': {'IgA': '未查', 'IgG': '未查', 'IgM': '未查', 'C1q': '未查', 'C3': '未查', 'Fib': '未查', 'HBcAg': '未查', 'HBsAg': '未查', 'Kappa': '未查', 'Lambda': '未查', 'IgG1': '未查', 'IgG2': '未查', 'IgG3': '未查', 'IgG4': '未查', 'ALB': '未查', 'PLA2R': '未查'},
                '部位': {'IgA': '未查', 'IgG': '未查', 'IgM': '未查', 'C1q': '未查', 'C3': '未查', 'Fib': '未查', 'HBcAg': '未查', 'HBsAg': '未查', 'Kappa': '未查', 'Lambda': '未查', 'IgG1': '未查', 'IgG2': '未查', 'IgG3': '未查', 'IgG4': '未查', 'ALB': '未查', 'PLA2R': '未查'},
                '形态': {'IgA': '未查', 'IgG': '未查', 'IgM': '未查', 'C1q': '未查', 'C3': '未查', 'Fib': '未查', 'HBcAg': '未查', 'HBsAg': '未查', 'Kappa': '未查', 'Lambda': '未查', 'IgG1': '未查', 'IgG2': '未查', 'IgG3': '未查', 'IgG4': '未查', 'ALB': '未查', 'PLA2R': '未查'},
                '分布': {'IgA': '未查', 'IgG': '未查', 'IgM': '未查', 'C1q': '未查', 'C3': '未查', 'Fib': '未查', 'HBcAg': '未查', 'HBsAg': '未查', 'Kappa': '未查', 'Lambda': '未查', 'IgG1': '未查', 'IgG2': '未查', 'IgG3': '未查', 'IgG4': '未查', 'ALB': '未查', 'PLA2R': '未查'},
                '其他': {'IgA': '未查', 'IgG': '未查', 'IgM': '未查', 'C1q': '未查', 'C3': '未查', 'Fib': '未查', 'HBcAg': '未查', 'HBsAg': '未查', 'Kappa': '未查', 'Lambda': '未查', 'IgG1': '未查', 'IgG2': '未查', 'IgG3': '未查', 'IgG4': '未查', 'ALB': '未查', 'PLA2R': '未查'}
            }

            用到的变量:
            _case_judge_dict:
                1 有 "部位" 和 "其他" 2个key.
                2 初始化
                3 根据 _case_judge_dict 结果, 将相应数据写入 _frozen_excel_res. 共 2^5 = 32种情况

            示例1:
            _val = ['Ms区', 'Cap袢']
            _case_judge_dict = {'部位': {'无': 0, '系膜区': 1, '毛细血管袢': 1}, '其他': {'肾小管': 0, '血管': 0}}
            写一次:
            frozen_excel_res["部位"]["IgA"] = "3"

            示例2:
            _val = ['Ms区', '血管']
            _case_judge_dict = {'部位': {'无': 0, '系膜区': 1, '毛细血管袢': 1}, '其他': {'肾小管': 0, '血管': 1}}
            写两次, (部位写一次, 其他写一次)
            frozen_excel_res["部位"]["IgA"] = "1"
            frozen_excel_res["其他"]["IgA"] = "2"
            """
            if _row_type == "部位":
                # 1 先切开
                _split_one_row = [re.split(r'[及+/、]', _each) for _each in _one_row]
                # 2 按情况, 决定写到 "部位" 还是写到 "其他"
                _part_map = kwargs["_part_map"]
                for _idx in range(0, len(_split_one_row)):
                    _case_judge_dict = Utils.build_case_judge_dict(_split_one_row, _part_map, _idx)
                    # 根据_case_judge_dict, 来给 _case 赋值
                    _frozen_excel_res = Utils.write_part_to_frozen_excel_res(item_list=_item_list,
                                                                             case_judge_dict=_case_judge_dict,
                                                                             frozen_excel_res=_frozen_excel_res,
                                                                             idx=_idx)
                    # print("item: %s" % _item_list[_idx])
                    # print("split_one: ", _split_one_row[_idx])
                    # print("case_judge_dict", _case_judge_dict)
                    # print("frozen_res")
                    # for kkk, vvv in _frozen_excel_res.items():
                    #     print(kkk, vvv)
                    # print("\n")

            # _row_type != "部位"
            else:
                for item_idx in range(0, len(_item_list)):
                    item_one = _item_list[item_idx]
                    _frozen_excel_res[_row_type][item_one] = _one_row[item_idx]

            return _frozen_excel_res

        # build主函数
        minus_idx_list = []
        item_list = []
        try:
            for idx in range(0, len(frozen_list)):
                one = frozen_list[idx]

                if "免疫荧光" in one[0]:
                    # 全角 和 半角 的冒号都会出现
                    frozen_excel_res["免疫荧光"] = one[0].split(":")[1].rstrip().lstrip() if ":" in one[0] else \
                        one[0].split("：")[1].rstrip().lstrip()
                    # 下一行
                    continue

                # 2 item_list = ["IgA", "IgG", "IgM", "C1q", "C3", "Fib", "HBcAg"]
                if self._is_item_row(one):
                    item_list = one
                    # 下一行
                    continue

                # intensity
                if "强度" in one[0]:
                    # 1 先把 "强度" 2个字从 one[0] 中删掉
                    one = __move_word_from_one(one)

                    # 2 构造 minus_idx_list (这一步骤是 强度 比 ["部位", "形态", "分布"] 特殊的地方.)
                    minus_idx_list = __build_minus_idx_list(one, minus_idx_list)

                    # 3 长度必须相等, 才可以逐个写入 frozen_excel_res
                    if len(one) == len(item_list):
                        __write(frozen_excel_res, item_list, one, _row_type="强度")
                    # 下一行
                    continue

                # part
                # 遇到"部位"时, 会同时更新frozen_excel_res中的 "部位" 和 "其他" 2个字段.
                if "部位" in one[0]:
                    # 1 先把 "部位" 2个字从 one[0] 中删掉
                    one = __move_word_from_one(one)
                    # 2 填充 "-" 项
                    one = __fill_one_based_on_minus_idx_list(one, minus_idx_list)
                    # 3 必须保证长度相等, 才可以写入 frozen_excel_res
                    if len(one) == len(item_list):
                        __write(frozen_excel_res,
                                item_list,
                                one,
                                _row_type="部位",
                                _part_map=self.param_dict["new_part_map"])
                    # 下一行
                    continue

                # shape
                if "形态" in one[0]:
                    # 1 先把 "形态" 2个字从 one[0] 中删掉
                    one = __move_word_from_one(one)

                    # 2 填充 "-" 项
                    one = __fill_one_based_on_minus_idx_list(one, minus_idx_list)

                    # 3 必须保证长度一直，才可以写入 frozen_excel_res
                    if len(one) == len(item_list):
                        __write(frozen_excel_res, item_list, one, _row_type="形态")
                    # 下一行
                    continue

                # distribution
                if "分布" in one[0]:
                    # 1 先把 "部位" 2个字从 one[0] 中删掉
                    one = __move_word_from_one(one)

                    # 2 填充 "-" 项
                    one = __fill_one_based_on_minus_idx_list(one, minus_idx_list)

                    # 3 必须保证长度相等, 才可以可以写入 frozen_excel_res
                    if len(one) == len(item_list):
                        __write(frozen_excel_res, item_list, one, _row_type="分布")
                    # 下一行
                    continue

        except Exception as e:
            # print("冰冻巨检统计异常: %s" % traceback.format_exc())
            pass
        return frozen_excel_res

    def _build_diagnostic_result_excel_columns(self,
                                               diagnostic_result_target,
                                               diagnostic_result_excel_res,
                                               show=True):
        """
        统计 诊断结果
        比如, 一个报告的诊断结果是 "狼疮性肾炎", 那么将 diagnostic_result_excel_res 中 "狼疮性肾炎" 的值 置1.

        参数:
        diagnostic_result_target - 标注列表 = [[0, 1, "disease", "狼疮性肾炎"], ...]
        diagnostic_result_excel_res - 初始化的统计字典 = {"狼疮性肾炎": 0, "IgA肾炎": 0, ...}
        """

        # 1 标注列表如果是空值 --> 不处理
        if len(diagnostic_result_target) == 0:
            return diagnostic_result_excel_res

        # disease_list = ["IgA肾炎(HASS)"]
        disease_list = [i[3] for i in diagnostic_result_target if i[2] == "disease"]
        try:
            # k = "IgA肾炎", v = ["IgA肾炎(HASS)", "IgA肾炎症", ...]
            for k, v in self.param_dict["clustered_disease_dict"].items():
                for disease_one in disease_list:
                    if disease_one in v:
                        diagnostic_result_excel_res[k] = 1

        except Exception as e:
            print("诊断结果统计时异常: %s" % str(e))

        if show:
            print("\n统计完成的疾病字典:")
            for k, v in diagnostic_result_excel_res.items():
                print(k, v)
            print("\n")

        return diagnostic_result_excel_res

    def _build_disease_typing_excel_columns(self, diagnostic_result_text, disease_typing_excel_res, show=True):
        """
        更新 各种 疾病分型 的值
        1 调用功能函数 __extract_typing_text, 将 diagnostic_result_text 中分型的 文本部分 提取出来
        2 re.split, 分离 Hass / 牛津 等不同的分型
        2 Hass / 牛津 等等不同的分型, 不同处理方式
        """

        def __extract_typing_text(_raw_str):
            """
            1 左 > 右, 拿到第一个左括号 (
            2 右 > 左, 拿到第最后一个右括号 )
            括号内是分型的数据, 括号外是诊断结果.

            示例输入:
            _raw_str = "狼疮性肾炎(5型)"
            _typing_text = "5型"
            """
            left = 0
            right = len(_raw_str)
            for idx in range(0, len(_raw_str)):
                if _raw_str[idx] in ["(", "（"]:
                    left = idx + 1
                    break

            for idx in range(len(_raw_str) - 1, -1, -1):
                if _raw_str[idx] in [")", "）"]:
                    right = idx
                    break

            _typing_text = _raw_str[left:right]
            # typing_text = re.split(r'[,，]]', typing_text)
            return _typing_text

        # 1 提取
        typing_text = __extract_typing_text(diagnostic_result_text)

        if show:
            print("\n统计完成的疾病字典:")
            for k, v in disease_typing_excel_res.items():
                print(k, v)
            print("\n")
        return disease_typing_excel_res

    def stat(self):
        # 统计
        for i in self.lossless_list:
            print("序号:[%s] 有效:%s" % (i["id"], i["valid"]))
            frozen_excel_res = self._init_frozen_excel_res(show=False)
            diagnostic_result_excel_res = self._init_diagnostic_result_excel_res(show=False)
            disease_typing_excel_res = self._init_disease_typing_excel_res(show=False)

            if i["valid"] == "1":
                # a. 冰冻巨检
                raw_frozen_str = i["frozen_macroscopy_text"]
                frozen_list = self._build_frozen_list(raw_frozen_str, show=False)

                frozen_excel_res = self._build_frozen_excel_columns(frozen_excel_res, frozen_list)
                # b. 诊断结果 (疾病 和 分型)
                # b.1 疾病
                diagnostic_result_target = i["diagnostic_result_target"]
                diagnostic_result_excel_res = self._build_diagnostic_result_excel_columns(diagnostic_result_target,
                                                                                          diagnostic_result_excel_res,
                                                                                          show=False
                                                                                          )

                # b.2 分型
                diagnostic_result_text = i["diagnostic_result_text"]
                disease_typing_excel_res = self._build_disease_typing_excel_columns(diagnostic_result_text,
                                                                                    disease_typing_excel_res,
                                                                                    show=False)

            # 将统计结果 合并到 i 中, 以便后面统一写入 df_data
            i["frozen_macroscopy_dict"] = frozen_excel_res
            i["diagnostic_result_dict"] = diagnostic_result_excel_res
            i["disease_typing_dict"] = disease_typing_excel_res

    def _update_frozen_macroscopy_dict(self, frozen_macroscopy_dict, dim_type):
        """
        功能函数 - 将 frozen_macroscopy_dict 数据写入 df_data
        frozen_macroscopy_dict 共5个key: "免疫荧光", "强度", "部位", "形态", "分布"

        参数:
        dim_type - 统计维度, "强度" / "部位" / "形态 / 分布"
        """
        type_map = {
            "强度": self.param_dict["intensity_map"],
            # "部位": self.param_dict["part_map"],
            "形态": self.param_dict["shape_map"],
            "分布": self.param_dict["distribution_map"]
        }
        try:
            for frozen_item_one in self.param_dict["frozen_items"]:
                if frozen_item_one not in frozen_macroscopy_dict[dim_type].keys():
                    continue

                # 映射规范值
                raw_value = frozen_macroscopy_dict[dim_type][frozen_item_one]
                # 部位 和 其他 特殊处理
                if (dim_type == "部位") or (dim_type == "其他"):
                    # 直接写入
                    self.df_data[frozen_item_one + dim_type].append(raw_value)
                else:
                    mapped_value = type_map[dim_type][raw_value]
                    # 映射后写入 df_data
                    self.df_data[frozen_item_one + dim_type].append(mapped_value)

        except Exception as e:
            print("update df_data 异常: %s" % traceback.format_exc())
        return

    def _update_diagnostic_result_dict(self, diagnostic_result_dict):
        """
        将诊断结果统计 写入 df_data
        """
        for k, v in diagnostic_result_dict.items():
            self.df_data[k].append(v)

        return

    def _update_disease_typing_dict(self, disease_typing_dict):
        """
        将 疾病分型 统计写入 df_data
        """
        for k, v in disease_typing_dict.items():
            self.df_data[k].append(v)

        return

    def write_to_df_data(self):
        for one in self.lossless_list:
            # 5-1 写入 无需处理的字段
            self.df_data["序号"].append(one["id"])
            self.df_data["有效数据"].append(one["valid"])
            self.df_data["诊断结果"].append(one["diagnostic_result_text"])
            self.df_data["镜下所见"].append(one["light_microscopy_text"])
            self.df_data["冰冻巨检描述"].append(one["frozen_macroscopy_text"])

            # 5-2 写入 冰冻巨检统计
            frozen_macroscopy_dict = one["frozen_macroscopy_dict"]
            # a 免疫荧光 有则写值，否则写"未查"
            if frozen_macroscopy_dict["免疫荧光"]:
                self.df_data["免疫荧光"].append(frozen_macroscopy_dict["免疫荧光"])
            else:
                self.df_data["免疫荧光"].append(self.NOT_CHECK)

            # b 强度 / 部位 / 形态 / 分布 / 其他
            for dim_one in self.param_dict["frozen_dims"]:
                self._update_frozen_macroscopy_dict(frozen_macroscopy_dict, dim_type=dim_one)

            # 5-3 写入 诊断结果统计 + 分型
            # 疾病
            self._update_diagnostic_result_dict(one["diagnostic_result_dict"])
            # 分型
            self._update_disease_typing_dict(one["disease_typing_dict"])

        # 6 新建df -> 并写入 df_data -> 最后写入 excel
        df = pd.DataFrame(data=self.df_data)
        print("完成")
        return df


def main():
    """
    该脚本的输入, 是 job_func.py 的输出文件 lossless.json.

    2019-12-27 会议后更新:
    变量词典部分 新增"其他"列, 目前共5个dim = ["强度", "部位", "形态", "分布", "其他"]
    1 "分布"中, 默认为2, 即"球性"
    2 "分布"中, "弥漫"也属于"球性", 即2.
    3 "形态"中, 增加3 = 1 + 2, 即3 = "线" + "颗粒"
    4 "部位"中, 如果除了 "CAP" / "MS", 还有其他，则归到"其他"dim中
    """
    # 1 实例化
    path = "/users/hk/dev/ExamStandard/backend/exam_standard/exam_standard_processor/data/"
    builder = KidneyStandardExcelBuilder(path + "param.json")

    # 2 读取lossless.json
    builder.read_raw_data(path + "lossless_test.json")

    # 3 init_df_data
    builder.init_df_data(show=False)

    # 4 统计 (将结果写入 self.lossless_list)
    builder.stat()

    # 5 写入
    # 5.1 创建 ExcelWriter 对象
    excel_writer = pd.ExcelWriter(path + "df_1230.xlsx")

    # 5.2 将统计结果写入 self.df_data; 变量词典写入 var_dict_df
    kidney_df = builder.write_to_df_data()
    var_dict_df = pd.read_excel(path + "var_dict.xlsx", sheet_name="变量字典")

    # 5.3 将 2个df_data 写入 excel_writer 的 2 个 sheet
    kidney_df.to_excel(excel_writer, sheet_name="sheet1")
    var_dict_df.to_excel(excel_writer, sheet_name="变量词典")

    excel_writer.save()


if __name__ == "__main__":
    main()
