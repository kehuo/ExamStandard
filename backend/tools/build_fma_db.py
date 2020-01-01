import importlib
from flask import Flask
import traceback
import json

from app.init_global import init_db, global_var

table_models  = importlib.import_module('db_models.db_models')
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
    parent_id = curNode.get("parent_id", 0)
    x = {
        'id': curId,
        'en_name': curNode['en_name'],
        'cn_name': '',
        'code': curNode['code'],
        'parent_id': parent_id,
    }
    seq.append(x)
    return

def seqBuild(treeObj):
    curNode = treeObj
    nodeStack = []
    records = 0
    seq = []
    curId = 1
    while True:
        addNode2Seq(curNode, curId, seq)
        records += 1
        if records % 1000 == 0:
            print('on going={}'.format(records))

        children = curNode.get('children', [])
        for childOne in children:
            childOne["parent_id"] = curId

        nodeStack.extend(children)
        if len(nodeStack) == 0:
            break
        curNode = nodeStack.pop(0)
        curId += 1
    print('total add={}'.format(records))
    return seq

def buildSeqFile(treePath, dstPath):
    treeObj = loadTree(treePath)
    seq = seqBuild(treeObj)
    dumpJson(seq, dstPath)
    return

from db_models.db_models import FMAEntity
def buildTableBatch(seq, db):
    ok = True
    try:
        for seqOne in seq:
            record = FMAEntity(
                id = seqOne['id'],
                en_name=seqOne['en_name'],
                cn_name=seqOne['cn_name'],
                code=seqOne['code'],
                parent_id=seqOne['parent_id'],
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

def clearTable(db):
    try:
        db.engine.execute('truncate table fma_entity')
    except Exception as e:
        err = traceback.format_exc()
        print('fail@clear table')
        raise Exception('fail@clear table')
    return

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
        treePath = '/Users/shengxu/Downloads/fma/tree.json'
        dstPath = '/Users/shengxu/Downloads/fma/fam_seq.txt'
        buildSeqFile(treePath, dstPath)
    elif task == 2:
        seqPath = '/Users/shengxu/Downloads/fma/fam_seq.txt'
        buildTable(seqPath, 0, 100)

    return

if __name__ == "__main__":
    main()