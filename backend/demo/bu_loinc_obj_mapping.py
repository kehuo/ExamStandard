import traceback
from sqlalchemy import or_

from bb_logger.logger import Logger
from db_models.db_models import LoincObjMapping
from common.utils.db import build_rows_result, update_record, build_one_result
from common.utils.http import getValueWithDefault


def getList(db, args):
    page = getValueWithDefault(args, 'page', 1)
    pageSize = getValueWithDefault(args, 'pageSize', 1000)
    keyword = getValueWithDefault(args, 'keyword', '').lower()

    try:
        query = db.session.query(
            LoincObjMapping.id, LoincObjMapping.src, LoincObjMapping.dst
        )
        if keyword != '':
            likeExpression = '%{}%'.format(keyword)
            query = query.filter(or_(
                LoincObjMapping.src.like(likeExpression),
                LoincObjMapping.dst.like(likeExpression)
            ))

        offset = (page - 1) * pageSize
        total = query.count()
        rows = query.order_by(LoincObjMapping.id).offset(offset).limit(pageSize).all()
        items = ['id', 'src', 'dst']
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
            'message': 'get loinc-obj mapping list failed'
        }
    return rst


def createOne(db, args):
    data = args['data']
    try:
        record = LoincObjMapping(
            src=data['src'],
            dst=data['dst'],
        )
        db.session.add(record)
        db.session.commit()

        rst = {
            'code': 'SUCCESS',
            'data': {
                'id': record.id,
            }
        }
    except Exception as e:
        db.session.rollback()
        err = traceback.format_exc()
        Logger.service(err, 'error')
        rst = {
            'code': 'FAILURE',
            'message': 'create loinc-obj mapping failed'
        }
    return rst


def getOne(db, part_id):
    try:
        record = db.session.query(
            LoincObjMapping.id, LoincObjMapping.src, LoincObjMapping.dst
        ) \
            .filter(LoincObjMapping.id == part_id) \
            .first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'get loinc-obj mapping one failed, not exist'
            }
        else:
            items = ['id', 'src', 'dst']
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
            'message': 'get loinc-obj mapping one failed'
        }
    return rst


def updateOne(db, args, part_id):
    data = args['data']
    try:
        record = db.session.query(LoincObjMapping).filter(LoincObjMapping.id == part_id).first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'update loinc-obj mapping one failed, not exist'
            }
        else:
            items = ['src', 'dst']
            update_record(record, items, data)
            db.session.commit()

            rst = {
                'code': 'SUCCESS',
                'data': {
                    'id': part_id,
                }
            }
    except Exception as e:
        err = traceback.format_exc()
        Logger.service(err, 'error')
        db.session.rollback()
        rst = {
            'code': 'FAILURE',
            'message': 'update loinc-obj mapping one failed'
        }
    return rst


def deleteOne(db, part_id):
    try:
        record = db.session.query(LoincObjMapping).filter(LoincObjMapping.id == part_id).first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'delete loinc-obj mapping one failed, not exist'
            }
        else:
            db.session.delete(record)
            db.session.commit()

            rst = {
                'code': 'SUCCESS',
                'data': {
                    'id': part_id,
                }
            }
    except Exception as e:
        err = traceback.format_exc()
        Logger.service(err, 'error')
        db.session.rollback()
        rst = {
            'code': 'FAILURE',
            'message': 'delete loinc-obj mapping one failed'
        }
    return rst
