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


def loadTree(treePath):
    fp = open(treePath, 'r', encoding='utf-8')
    treeObj = json.load(fp)
    fp.close()
    return treeObj


def dumpJson(seq, dstPath):
    fp = open(dstPath, 'w', encoding='utf-8')
    json.dump(seq, fp, ensure_ascii=False)
    fp.close()
    return

def addNode2Seq(curNode, curId, seq):
    start = curId
    for x in curNode:
        y = {
            'id': start,
            'class_x': x['CLASS'],
            'component': x['COMPONENT'],
            'lonic_number': x['LOINC_NUM'],
            'method_typ': x['METHOD_TYP'],
            'property': x['PROPERTY'],
            'scale_typ': x['SCALE_TYP'],
            'system': x['SYSTEM'],
            'time_aspect': x['TIME_ASPECT'],
        }
        seq.append(y)
        start += 1
    return start

def buildSeq(xObj):
    curNode = xObj
    nodeStack = []
    records = 0
    seq = []
    curId = 1
    while True:
        if type(curNode) == list:
            curId = addNode2Seq(curNode, curId, seq)
            records += len(curNode)
            print('on going={} {}'.format(records, curId))
        else:
            children = list(curNode.values())
            nodeStack.extend(children)
        if len(nodeStack) == 0:
            break
        curNode = nodeStack.pop(0)
    print('total add={}'.format(records))
    return seq

def buildSeqFile(treePath, dstPath):
    xObj = loadTree(treePath)
    seq = buildSeq(xObj)
    dumpJson(seq, dstPath)
    return

def clearTable(db):
    try:
        db.engine.execute('truncate table loinc')
    except Exception as e:
        err = traceback.format_exc()
        print('fail@clear table')
        raise Exception('fail@clear table')
    return

from db_models.db_models import Loinc
def buildTableBatch(seq, db):
    ok = True
    try:
        for seqOne in seq:
            record = Loinc(
                id = seqOne['id'],
                class_x=seqOne['class_x'],
                component=seqOne['component'],
                loinc_number=seqOne['lonic_number'],
                method_typ=seqOne['method_typ'],
                property=seqOne['property'],
                system=seqOne['system'],
                time_aspect=seqOne['time_aspect'],
                scale_typ=seqOne['scale_typ'],
            )
            db.session.add(record)
        db.session.flush()
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        err = traceback.format_exc()
        print('err', err)
        ok = False
    return ok

def buildTable(treePath, start, pageSize, truncFirst=True):
    seq = loadTree(treePath)
    if truncFirst:
        clearTable(db)

    startIdx = start
    maxIdx = len(seq)
    while True:
        endIdx = startIdx + pageSize
        endIdx = min(maxIdx, endIdx)
        print('start@={} {}'.format(startIdx, endIdx))
        seqBatch = seq[startIdx:endIdx]
        if len(seqBatch) == 0:
            break

        ok = buildTableBatch(seqBatch, db)
        if not ok:
            print('fail@={} {}'.format(startIdx, endIdx))
            break
        print('success@={} {}'.format(startIdx, endIdx))

        if endIdx == maxIdx:
            break
        startIdx = endIdx
    return

def main():
    task = 2

    if task == 1:
        treePath = '/Users/shengxu/Work/temp/ExamStandard/backend/exam_standard/normalization_processor/data/loinc_tree.json'
        dstPath = '/Users/shengxu/Work/temp/ExamStandard/backend/tools/loinc_seq.txt'
        buildSeqFile(treePath, dstPath)
    elif task == 2:
        treePath = '/Users/shengxu/Work/temp/ExamStandard/backend/tools/loinc_seq.txt'
        buildTable(treePath, 0, 100)
    return

if __name__ == "__main__":
    main()