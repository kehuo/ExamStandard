from exam_standard.exam_standard_processor.utils import load_json_file
from exam_standard.normalization_processor.normalizer import Normalizer
import json
import traceback
import pandas as pd
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from db_models.db_models import KidneyNameMapping, Kidney
import pymysql
pymysql.install_as_MySQLdb()


class Utils(object):
    # @staticmethod
    # def init_db():
    #     config = {
    #         "user": "generator",
    #         "password": "Genetrator@123",
    #         "host": "172.18.0.114",
    #         "port": 3306,
    #         "db_name": "pf_demo"
    #     }
    #     app = Flask(__name__)
    #     app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://%s:%s@%s:%s/%s" % (
    #         config["user"], config["password"], config["host"], config["port"], config["db_name"]
    #     )
    #     db = SQLAlchemy(app)
    #     return db

    @staticmethod
    def create_np(db):
        np_cfg_path = "/users/hk/dev/ExamStandard/backend/exam_standard/normalization_processor/processor_config.json"
        with open(np_cfg_path, "r", encoding="utf-8") as f:
            np_cfg = json.load(f)
        np = Normalizer(config=np_cfg, db=db)
        return np

    @staticmethod
    def test_np(db):
        """
        "id": xxx,
            "exam_class": "",
            "text": "",
            "target": [],
            "res": []
        """
        np = Utils.create_np(db)

        # 2 获取一个测试的 standard_data
        test_json_path = "/users/hk/dev/ExamStandard/backend/exam_standard/exam_standard_processor/data/"
        test_json_name = "norm_test.json"
        raw_test_one = load_json_file(test_json_path + test_json_name)[0]

        standard_data = {
            "id": raw_test_one["id"],
            "exam_class": "",
            "text": raw_test_one["light_microscopy_text"],
            "target": raw_test_one["light_microscopy_target"],
            "res": raw_test_one["res"]
        }
        norm_res = np.run(standard_data)
        print(norm_res)
        return


class LightMicroscopyBuilder(object):
    """
    该类, 用来结构化 "镜下所见" 列.
    """

    def __init__(self, param_dict_path):
        """
        参数:
        param_dict_path: 该类可能需要的参数配置文件的路径.

        属性:
        norm: norm.json, 400份报告的数据
        app: 用来初始化 db
        df_data: 写入 DataFrame 有2种方式, 一种是动态的逐行写入; 一种是一次性写入大dict. 如果一次性写入大dict,那么需要该参数.
        db: Flask 数据库操作对象
        np: Normalizer 归一化对象
        df: Pandas DataFrame 对象
        """
        self.norm = []
        self.app = Flask(__name__)
        self.df_data = None
        self.db = None
        self.np = None
        self.df = None

        self.NOT_CHECK = "/"
        self.NO_VALUE = "无"

        # 2 读取配置文件
        try:
            with open(param_dict_path, "r", encoding="utf-8") as param_f:
                self.param_dict = json.load(param_f)
        except Exception as e:
            self.param_dict = {}
        return

    def read(self, path, **kwargs):
        """读取 norm.json"""
        self.norm = load_json_file(path)

    def init_db(self, test=True, test_cn_name="多灶萎缩"):
        """初始化 db"""
        db_config = self.param_dict["db_config"]
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://%s:%s@%s:%s/%s" % (
            db_config["DB_USER"],
            db_config["DB_PASSWORD"],
            db_config["DB_HOST"],
            db_config["DB_PORT"],
            db_config["DB_NAME"]
        )
        self.app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

        self.db = SQLAlchemy(self.app)

        if test:
            record = self.db.session.query(Kidney).filter(Kidney.cn_name == test_cn_name).first()
            print("多灶萎缩的 db 查询结果: ", record.kid)
        return

    def _connect(self, tag_one):
        return "&" + tag_one[2] + "@" + tag_one[3] + "^"

    def init_df(self):
        """
        df.loc = 1-400
        df.iloc = 0-399
        """
        cols = ["镜下所见"]
        # indexes = 1-400, 为了和norm.json数据中的 "id" 字段对应
        indexes = range(1, len(self.norm) + 1)
        df = pd.DataFrame(columns=cols, index=indexes)

        # 镜下所见 填写对应的 text
        for idx in range(1, len(indexes) + 1):
            text = self.norm[idx - 1]["light_microscopy_text"]
            for col_one in df.columns:
                df.loc[idx][col_one] = text

        self.df = df
        return

    def _build(self, curr_row_idx, curr_norm):
        """"
        逐行写入 self.df

        参数:
        curr_row_idx: 当前是第几行 (即 self.df.loc[curr_row_idx])
        curr_norm: 当前这一行的归一化结果

        流程
        对 bb_extension 的每一项one:
        1 one = {'text': '31个肾小球',
                 'tags': [['8', '10', 'symptom_desc', '31个'], ['11', '13', 'symptom_obj', '肾小球']],
                 'radlex_info': [{'tag': ['8', '10', 'symptom_desc', '31个'],
                                  'cn_name': '数值型描述或结果',
                                  'radlex_id': ['KID9999']},
                                 {'tag': ['11', '13', 'symptom_obj', '肾小球'],
                                  'cn_name': '肾小球',
                                  'radlex_id': ['KID2_1_1_肾小球']}],
                 'detailed_text': '#8$10&symptom_desc@31个^#11$13&symptom_obj@肾小球^'
            }

        2 用one["radlex_info"]列表中每一项的 cn_name 属性, 构造一个列名curr_col = "数值型描述或结果肾小球"
        3 从 self.df.loc[idx].columns 查看: 是否有 curr_col 这一列
            3.1 如果没有 -> 新建一列
                a. 如果列名不包括 "数值型描述或结果" -> 那么 写入一个 "是", 代表这一项检查结果是阳性
                b. 如果列名包括 "数值型描述或结果" -> 那么把 "xxx个" 的 xxx 作为值写入

            3.2 如果有 -> 判断这一列的值 是否为 "未查"
                a. 不是"未查" -> 该列已经被填写 -> 先print -> 后续再想处理办法 > break
                b. 是"未查" -> 从未被填写 -> 那么可以直接写入一个值
                    a.1 如果列名不包括 "数值型描述或结果" -> 那么 写入一个 "是", 代表这一项检查结果是阳性
                    a.2 如果列名包括 "数值型描述或结果" -> 那么把 "xxx个" 的 xxx 作为值写入




        """
        def _get_write_numerical_word(_radlex_info, _NUMERICAL_DESCRIPTOR):
            _write_word = None
            for _each_radlex in _radlex_info:
                if _each_radlex["cn_name"] == _NUMERICAL_DESCRIPTOR:
                    if "个" in _each_radlex["tag"][3]:
                        _write_word = _each_radlex["tag"][3][:-1]
                    else:
                        _write_word = _each_radlex["tag"][3]
                    break
            return _write_word

        bb_extension = curr_norm["bb_extension"]
        NUMERICAL_DESCRIPTOR = "数值描述"

        for idx in range(len(bb_extension)):
            one = bb_extension[idx]
            radlex_info = one["radlex_info"]
            cn_name_list = [one["cn_name"] for one in radlex_info]

            curr_col = "^".join(cn_name_list)

            # 3.1 columns 没有这一列 -> 先新建一列(全填"未查")
            if curr_col not in self.df.columns:
                self.df[curr_col] = self.NOT_CHECK
                # a. 没有 数值型结果 -> 写入 "是"
                if NUMERICAL_DESCRIPTOR not in curr_col:
                    self.df.loc[curr_row_idx][curr_col] = "是"
                    continue
                # b 有 数值型结果 -> 把数值写进去
                write_word = _get_write_numerical_word(radlex_info, NUMERICAL_DESCRIPTOR)
                if write_word:
                    self.df.loc[curr_row_idx][curr_col] = write_word
                continue

            # 3.2 columns 有这一列
            # a 不是"未查" (即 该列已被填写)
            if self.df.loc[curr_row_idx][curr_col] != self.NOT_CHECK:
                print("遇到[%s]时该列已经被填写，填写值:[%s]" % (curr_col, self.df.loc[curr_row_idx][curr_col]))
                continue

            # b 是"未查"
            # a.1 没有 数值型结果 -> 写入 "是"
            if NUMERICAL_DESCRIPTOR not in curr_col:
                self.df.loc[curr_row_idx][curr_col] = "是"
                continue

            # a.2 有 数值型结果 -> 把数值写进去
            write_word = _get_write_numerical_word(radlex_info, NUMERICAL_DESCRIPTOR)
            if write_word:
                self.df.loc[curr_row_idx][curr_col] = write_word

        return

    def stat(self):
        for idx in range(0, len(self.norm)):
            try:
                i = self.norm[idx]
                print(i["id"])
                if i["valid"] == "0":
                    continue

                # 结果直接写入 self.df
                # 当场调用 np.run ,获取 curr_norm
                self.np = Utils.create_np(self.db)
                curr_norm = self.np.run(
                    {"id": i["id"],
                     "exam_class": "",
                     "text": i["light_microscopy_text"],
                     "target": i["light_microscopy_target"],
                     "res": i["res"]}
                )

                self._build(curr_row_idx=i["id"], curr_norm=curr_norm[0])
            except Exception as e:
                print("出错了: %s" % traceback.format_exc())
                continue
        return

    def write(self, excel_name):
        self.df.to_excel(excel_name)
        return


def main():
    """
    2019-12-30注释 - 这里既可以送如lossless.json, 也可以送入 norm.json
    因为 lossless.json 和 norm.json 的区别，只是多了个 "norm" 字段.
    而当前 lb 在处理时, 当直接实时调用 np.run, 获取norm字段的结果的.
    """
    # 1 实例化
    path = "/users/hk/dev/ExamStandard/backend/exam_standard/exam_standard_processor/data/"
    lb = LightMicroscopyBuilder(path + "param.json")

    # 2 构造 self.db
    lb.init_db(test=False)

    # 3 读400条报告 -> self.norm
    name = "lossless.json"
    lb.read(path + name, start_idx=0, read_count=400)

    # 构造 self.df
    lb.init_df()

    # 对 self.norm 逐条统计 + 结构化
    lb.stat()

    # 写入 excel
    test_res_name = "df.xlsx"
    lb.write(path + test_res_name)


if __name__ == '__main__':
    main()
