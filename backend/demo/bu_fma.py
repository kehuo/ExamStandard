import traceback
from sqlalchemy import or_
from bb_logger.logger import Logger
from common.utils.db import build_rows_result, update_record, build_one_result
from common.utils.http import getValueWithDefault
from db_models.db_models import FMAEntity


def getList(db, args):
    keyword = getValueWithDefault(args, 'keyword', None)
    page = getValueWithDefault(args, 'page', 1)
    pageSize = getValueWithDefault(args, 'pageSize', 1000)
    parentCode = getValueWithDefault(args, 'parent', None)
    pid = None

    try:
        if not parentCode is None and parentCode != '':
            pRecord = db.session.query(FMAEntity).filter(FMAEntity.code == parentCode).first()
            if pRecord is None:
                rst = {
                    'code': 'FAILURE',
                    'message': 'get FMA list failed @ no parent exist'
                }
                return rst
            pid = pRecord.id

        query = db.session.query(
            FMAEntity.id, FMAEntity.code, FMAEntity.en_name, FMAEntity.cn_name,
            FMAEntity.parent_id
        )

        if not keyword is None and keyword != '':
            query = query.filter(or_(FMAEntity.cn_name.contains(keyword),
                                     FMAEntity.en_name.contains(keyword)
                                     ))
        if not pid is None:
            query = query.filter(FMAEntity.parent_id == pid)

        offset = (page - 1) * pageSize
        total = query.count()
        rows = query.order_by(FMAEntity.id).offset(offset).limit(pageSize).all()
        items = ["id", "code", "en_name", "cn_name", "parent_id"]
        data = build_rows_result(rows, items)
        rst = {
            'code': 'SUCCESS',
            'data': {
                'total': total,
                'items': data
            }
        }
    except Exception as e:
        db.session.rollback()
        err = traceback.format_exc()
        Logger.service(err, 'error')
        rst = {
            'code': 'FAILURE',
            'message': 'get FMA list failed'
        }
    return rst


def getOne(db, caseId):
    try:
        record = db.session.query(
            FMAEntity.id, FMAEntity.code, FMAEntity.en_name, FMAEntity.cn_name,
            FMAEntity.parent_id
        ) \
            .filter(FMAEntity.id == caseId) \
            .first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'get FMA one failed, not exist'
            }
        else:
            items = ["id", "code", "en_name", "cn_name", "parent_id"]
            data = build_one_result(record, items)
            rst = {
                'code': 'SUCCESS',
                'data': data
            }
    except Exception as e:
        err = traceback.format_exc()
        Logger.service(err, 'error')
        db.session.rollback()
        rst = {
            'code': 'FAILURE',
            'message': 'get FMA one failed'
        }
    return rst


def updateOne(db, args, caseId):
    data = args['data']
    try:
        record = db.session.query(FMAEntity).filter(FMAEntity.id == caseId).first()

        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'update FMA one failed, not exist'
            }
        else:
            items = ["code", "en_name", "cn_name","parent_id"]
            update_record(record, items, data)
            db.session.commit()

            rst = {
                'code': 'SUCCESS',
                'data': {
                    'id': caseId,
                }
            }
    except Exception as e:
        err = traceback.format_exc()
        Logger.service(err, 'error')
        db.session.rollback()
        rst = {
            'code': 'FAILURE',
            'message': 'update FMA one failed'
        }
    return rst


def getParentTree(db, args):
    code = args['code']
    data = []
    idx = 0
    tgtId = None
    try:
        while True:
            if idx == 0:
                record = db.session.query(
                    FMAEntity.id, FMAEntity.code, FMAEntity.en_name, FMAEntity.cn_name,
                    FMAEntity.parent_id
                ) \
                    .filter(FMAEntity.code == code) \
                    .first()
                idx += 1
            else:
                record = db.session.query(
                    FMAEntity.id, FMAEntity.code, FMAEntity.en_name, FMAEntity.cn_name,
                    FMAEntity.parent_id
                ) \
                    .filter(FMAEntity.id == tgtId) \
                    .first()
            if record is None:
                data = None
                break

            items = ["id", "code", "en_name", "cn_name", "parent_id"]
            x = build_one_result(record, items)
            data.insert(0, x)

            if x['code'] == 'ROOT':
                break
            tgtId = x['parent_id']

        rst = {
            'code': 'SUCCESS',
            'data': data
        }
    except Exception as e:
        err = traceback.format_exc()
        Logger.service(err, 'error')
        db.session.rollback()
        data = None

    if data is None:
        rst = {
            'code': 'FAILURE',
            'message': 'get FMA parent tree failed'
        }
    return rst
