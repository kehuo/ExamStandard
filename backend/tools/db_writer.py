import json
from datetime import datetime
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import sys
sys.path.insert(0, "/users/hk/dev/ExamStandard/backend")

from db_models.db_models import ReportTaggingSamples, Kidney
from exam_standard.exam_standard_processor.utils import load_json_file


class DatabaseWriter(object):
    """
    该类 用来将 goldset.json 写入数据表
    它是所有数据表写入类的基础类, 他定义了一些通用的属性和方法

    比如, 你想写入 report_tagging_samples, 那么 report_writer = ReportTaggingSamplesWriter(DatabaseWriter)
    """
    def __init__(self, abs_data_path):
        self.abs_data_path = abs_data_path
        self.data = []

        self.app = None
        self.db = None

        self.cfg = {
            "db_user": "root",
            "db_password": "huoke590880",
            "db_host": "127.0.0.1",
            "db_port": 3306,
            "db_name": "exam_standard"
        }
        return

    def _load_data(self):
        pass

    def init_db(self):
        self.app = Flask(__name__)
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://%s:%s@%s:%s/%s" % (
            self.cfg["db_user"],
            self.cfg["db_password"],
            self.cfg["db_host"],
            self.cfg["db_port"],
            self.cfg["db_name"]
        )
        self.app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
        self.db = SQLAlchemy(self.app)
        return

    def write(self):
        pass


class ReportTaggingSamplesWriter(DatabaseWriter):
    """该类 用来将 goldset.json 写入 report_tagging_samples 数据表"""
    def __init__(self, abs_data_path):
        DatabaseWriter.__init__(self, abs_data_path)
        self.init_db()
        return

    def _load_data(self):
        with open(self.abs_data_path, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    self.data.append(json.loads(line))
                except Exception as e:
                    print('error line: {}'.format(line))
        return

    def write(self):
        self._load_data()

        for one in self.data:
            if len(one["input"]["diagnostic_result_text"]) > 0 and \
                    len(one["diagnostic_result_target"]) > 0 and \
                    len(one["input"]["light_microscopy_text"]) > 0 and \
                    len(one["light_microscopy_target"]) > 0:
                diagnosis = json.dumps(one["input"]["diagnostic_result_text"], ensure_ascii=False)
                diagnosis_tag = json.dumps(one["diagnostic_result_target"], ensure_ascii=False)
                content = json.dumps(one["input"]["light_microscopy_text"], ensure_ascii=False)
                content_tag = json.dumps(one["light_microscopy_target"], ensure_ascii=False)
                today_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                try:
                    record = ReportTaggingSamples(
                        uuid=one["id"],
                        diagnosis=diagnosis,
                        diagnosis_tag=diagnosis_tag,
                        content=content,
                        content_tag=content_tag,
                        type="肾病理报告",
                        created_at=today_str,
                        created_by=1,
                        updated_at=today_str,
                        updated_by=1
                    )
                    self.db.session.add(record)
                    self.db.session.commit()
                except Exception as e:
                    print("id=%d错误:%s" % (one["id"], str(e)))
        return


class KidneyTreeWriter(DatabaseWriter):
    def __init__(self, abs_data_path):
        DatabaseWriter.__init__(self, abs_data_path)
        self.init_db()

    def _load_data(self):
        with open(self.abs_data_path, "r", encoding="utf-8") as f:
            self.data = json.load(f)
        return

    def write(self):
        """
        1 dfs 深度优先搜索, 将有层级结构的 kidney_tree, 平铺到 flat_tree 中.
        2 对 flat_tree 的每一项, 做2个步骤:
            2.1 写入 除了 parent_id 的所有字段 > db.session.commit()
            2.2 再尝试从表中搜索自己和自己的爸爸, 并将爸爸的id, 写到自己的 parent_id 字段.
        """
        # 1 dfs
        def __dfs(start_node):
            """
            1. 初始化1个已经有根结点的队列
            2. 只要队列不为空, 就一直搜索
            :param start_node: 初始节点, 即 self.data 整颗树.
            """
            # 初始化一个queue
            queue = [start_node]
            res = []
            while queue:
                # 当前节点
                curr = queue.pop(0)
                res.append(curr)

                if "children" in curr.keys():
                    # 将当前节点所有的 children 节点放入 queue
                    for c in curr["children"]:
                        queue.append(c)
            return res

        self._load_data()
        flat_tree = __dfs(start_node=self.data)

        # 2
        today_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        try:
            for one in flat_tree:
                # 2.1 除了 parent_id 的所有字段
                record = Kidney(
                    kid=one["kid"],
                    en_name=one["en_name"],
                    cn_name=one["cn_name"],
                    parent_kid=one["parents"][0],
                    created_at=today_str,
                    created_by=1,
                    updated_at=today_str,
                    updated_by=1
                )
                self.db.session.add(record)
                self.db.session.commit()

                # 2.2 parent_id 字段
                # 找到自己
                son = self.db.session.query(Kidney).filter(Kidney.kid == one["kid"]).first()
                # 找到自己爸爸
                parent = self.db.session.query(Kidney).filter(Kidney.kid == one["parents"][0]).first()

                # 将爸爸的 Kidney.id 赋值给 自己的Kidney.parent_id
                if parent:
                    son.parent_id = parent.id
                else:
                    # 根结点没有parent_id, 默认为0
                    son.parent_id = 0
                self.db.session.commit()
        except Exception as e:
            print("错误: %s" % str(e))
        return


def main():
    base_path = "/users/hk/dev/ExamStandard/backend/"
    path_map = {
        "report_tagging_samples": {
            "path": "exam_standard/exam_standard_processor/data/",
            "name": "goldset.json"
        },
        "kidney": {
            "path": "exam_standard/normalization_processor/data/",
            "name": "kidney_tree.json"
        }
    }

    # 1 报告
    report_writer = ReportTaggingSamplesWriter(
        base_path + path_map["report_tagging_samples"]["path"] + path_map["report_tagging_samples"]["name"]
    )
    report_writer.write()

    # 2 kidney tree
    kidney_writer = KidneyTreeWriter(
        base_path + path_map["kidney"]["path"] + path_map["kidney"]["name"]
    )
    kidney_writer.write()


if __name__ == '__main__':
    main()
