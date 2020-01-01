import traceback
from sqlalchemy import or_
from bb_logger.logger import Logger
from common.utils.db import build_rows_result, update_record, build_one_result
from common.utils.http import getValueWithDefault
from db_models.db_models import Radlex


def getList(db, args):
    keyword = getValueWithDefault(args, 'keyword', None)
    page = getValueWithDefault(args, 'page', 1)
    pageSize = getValueWithDefault(args, 'pageSize', 1000)
    parentRid = getValueWithDefault(args, 'parent', None)

    try:
        query = db.session.query(
            Radlex.id, Radlex.rid, Radlex.en_name, Radlex.cn_name,
            Radlex.parent_id, Radlex.parent_rid
        )

        if not keyword is None and keyword != '':
            query = query.filter(or_(Radlex.cn_name.contains(keyword),
                                     Radlex.en_name.contains(keyword)
                                     ))
        if not parentRid is None and parentRid != '':
            query = query.filter(Radlex.parent_rid == parentRid)

        offset = (page - 1) * pageSize
        total = query.count()
        rows = query.order_by(Radlex.id).offset(offset).limit(pageSize).all()
        items = ["id", "rid", "en_name", "cn_name", "parent_id", "parent_rid"]
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
            'message': 'get Radlex list failed'
        }
    return rst


def getOne(db, caseId):
    try:
        record = db.session.query(
            Radlex.id, Radlex.rid, Radlex.en_name, Radlex.cn_name,
            Radlex.parent_id, Radlex.parent_rid
        ) \
            .filter(Radlex.id == caseId) \
            .first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'get Radlex one failed, not exist'
            }
        else:
            items = ["id", "rid", "en_name", "cn_name", "parent_id", "parent_rid"]
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
            'message': 'get Radlex one failed'
        }
    return rst


def updateOne(db, args, caseId):
    data = args['data']
    try:
        record = db.session.query(Radlex).filter(Radlex.id == caseId).first()

        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'update Radlex one failed, not exist'
            }
        else:
            items = ["rid", "en_name", "cn_name", "parent_id", "parent_rid"]
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
            'message': 'update Radlex one failed'
        }
    return rst


def getParentTree(db, args):
    rid = args['rid']
    data = []
    try:
        while True:
            record = db.session.query(
                Radlex.id, Radlex.rid, Radlex.en_name, Radlex.cn_name,
                Radlex.parent_id, Radlex.parent_rid
            ) \
                .filter(Radlex.rid == rid) \
                .first()
            if record is None:
                data = None
                break

            items = ["id", "rid", "en_name", "cn_name", "parent_id", "parent_rid"]
            x = build_one_result(record, items)
            data.insert(0, x)

            if x['rid'] == 'RID1':
                break
            rid = x['parent_rid']

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
            'message': 'update Radlex one failed'
        }
    return rst
