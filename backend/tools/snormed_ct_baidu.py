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
from tools.ramdis_utils import buildCnContext

table_models  = importlib.import_module('db_models.db_models')
bg_app = Flask(__name__)
bg_app.config.from_pyfile('../service.conf', silent=True)

global global_var
global_var = {}
init_db(bg_app, global_var)
db = global_var['db']

appid = '20190902000331416'  # 你的appid
secretKey = 'kDg1IvRbXPO4WY4xUPjl'  # 你的密钥

def createClient(isHttp):
    client = None
    try:
        if isHttp:
            client = http.client.HTTPConnection('api.fanyi.baidu.com')
        else:
            client = http.client.HTTPSConnection('fanyi-api.baidu.com')
    except Exception as e:
        db.session.rollback()
        error = traceback.format_exc()
        print(error)

        raise Exception('fail@client')
    return client

def getCurrentPage(db, page, pageSize, startId):
    from db_models.db_models import SnomedCtEntity
    records = None
    try:
        offset = (page - 1) * pageSize
        records = db.session.query(SnomedCtEntity) \
            .filter(SnomedCtEntity.id >= startId) \
            .order_by(SnomedCtEntity.id) \
            .offset(offset).limit(pageSize).all()
    except Exception as e:
        db.session.rollback()
        error = traceback.format_exc()
        print(error)
    return records

def translateEmptyOnes(db, records, client):
    rst = []
    for recordOne in records:
        q = recordOne.en_name
        if q is None or q == '':
            continue

        myurl = '/api/trans/vip/translate'
        fromLang = 'en'
        toLang = 'zh'
        salt = random.randint(32768, 65536)

        sign = appid + q + str(salt) + secretKey
        m1 = hashlib.md5()
        m1.update(sign.encode(encoding='utf-8'))
        str_sign = m1.hexdigest()

        myurl = myurl + '?appid=' + appid + '&q=' + urllib.parse.quote(
            q) + '&from=' + fromLang + '&to=' + toLang + '&salt=' + str(
            salt) + '&sign=' + str_sign
        client.request('GET', myurl)
        response = client.getresponse()
        result = response.read()
        m = result.decode('utf-8')
        mObj = json.loads(m)

        if not 'trans_result' in mObj:
            print('can not translate', q)
            continue

        recordOne.cn_name = mObj['trans_result'][0]['dst']
        rst.append(recordOne)

        print('baidu --', recordOne.id)
        time.sleep(1.5)
    if len(rst) > 0:
        db.session.flush()
        db.session.commit()
    return rst

# def updateRecords(newAs, db):
#     try:
#         validCnt = 0
#         for one in newAs:
#             record = db.session.query(RamdisCases).filter_by(id=one['id']).first()
#             if record is None:
#                 print('bad {}'.format(json.dumps(one, ensure_ascii=False)))
#                 continue
#             record.cn_context = buildCnContext(one)
#             db.session.flush()
#
#             # print('success {}'.format(json.dumps(one, ensure_ascii=False)))
#             validCnt += 1
#         db.session.commit()
#         print('success {}'.format(validCnt))
#     except Exception as e:
#         db.session.rollback()
#         error = traceback.format_exc()
#         print(error)
#     return

def translateCtEntity(client, startId=0):
    pageSize = 10
    page = 1

    while True:
        records = getCurrentPage(db, page, pageSize, startId)
        if records is None:
            break

        if len(records) > 0:
            newAs = translateEmptyOnes(db, records, client)
            # if len(newAs) > 0:
            #     updateRecords(newAs, db)
            page = page + 1
            print('finish = {}'.format(startId + (page -1)*pageSize))
        else:
            break
    return

def main():
    isHttp = True
    client = createClient(isHttp)

    startId = 0
    translateCtEntity(client, startId)

    client.close()
    return

if __name__ == "__main__":
    main()