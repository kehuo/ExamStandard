import importlib
from flask import Flask
import traceback
import urllib.parse
import random
import time
import json

from app.init_global import init_db, global_var
from common.utils.db import build_rows_result
import http.client
import hashlib
from common.utils.http import getValueWithDefault

table_models = importlib.import_module('db_models.db_models')
bg_app = Flask(__name__)
bg_app.config.from_pyfile('../service.conf', silent=True)

global global_var
global_var = {}
init_db(bg_app, global_var)
db = global_var['db']

from db_models.db_models import RadlexNameMapping

def loadJson(treePath):
    fp = open(treePath, 'r', encoding='utf-8')
    treeObj = json.load(fp)
    fp.close()
    return treeObj

def dumpJson(seq, dstPath):
    fp = open(dstPath, 'w', encoding='utf-8')
    json.dump(seq, fp, ensure_ascii=False)
    fp.close()
    return

def buildObjMap(srcPath, db):
    objMap = loadJson(srcPath)

    ok = True
    try:
        for tag_type, tagMap in objMap.items():
            for k,v in tagMap.items():
                vStr = json.dumps(v, ensure_ascii=False)
                record = RadlexNameMapping(
                    tag_type = tag_type,
                    src = k,
                    dst = vStr,
                )
                db.session.add(record)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        err = traceback.format_exc()
        print('err', err)
        ok = False
    return ok

def main():
    task = 1

    if task == 1:
        srcPath = '/Users/shengxu/Work/temp/ExamStandard/backend/exam_standard/normalization_processor/data/radlex_cn_name_map.json'
        buildObjMap(srcPath, db)

    return

if __name__ == "__main__":
    main()