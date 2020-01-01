import pymysql
import json


class KidneyCnMapWriter(object):
    """该类用来将 kidney_cn_name_map.json 文件, 写入数据库"""
    def __init__(self):
        self.raw_data = dict()
        self.conn = None
        self.cursor = None

    def read(self, json_path):
        with open(json_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
        self.raw_data = raw_data
        return

    def init_db(self, db_config):
        self.conn = pymysql.connect(**db_config)
        self.cursor = self.conn.cursor()
        return

    def write(self):
        try:
            # tag_type = "symptom_obj"
            for tag_type, v in self.raw_data.items():
                for src, dst in v.items():
                    # src = 球性硬化
                    # dst = {'cn_name': '球形硬化', 'kid': 'KID30_球形硬化'}
                    sql = "insert into kidney_name_mapping (tag_type, src, dst) VALUES (%s, %s, %s)"
                    self.cursor.execute(sql, (tag_type, src, json.dumps(dst, ensure_ascii=False)))
                    self.conn.commit()
        except Exception as e:
            print("write error\n", str(e))


def main():
    """将 kidney_cn_name_map.json 写入 数据库"""
    # 1
    kmw = KidneyCnMapWriter()

    # 2
    path = "/users/hk/dev/ExamStandard/backend/exam_standard/normalization_processor/data/"
    name = "kidney_cn_name_map.json"
    kmw.read(path + name)

    # 3
    db_config = {
        "host": "172.18.0.114",
        "port": 3306,
        "user": "generator",
        "password": "Genetrator@123",
        "db": "pf_demo"
    }

    kmw.init_db(db_config)

    # 4
    kmw.write()


if __name__ == '__main__':
    main()
