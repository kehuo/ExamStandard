import traceback
from sqlalchemy import or_
from bb_logger.logger import Logger
from db_models.db_models import RadlexNameMapping
from common.utils.db import build_rows_result, update_record, build_one_result
from common.utils.http import getValueWithDefault


def getList(db, args):
    page = getValueWithDefault(args, 'page', 1)
    pageSize = getValueWithDefault(args, 'pageSize', 1000)
    keyword = getValueWithDefault(args, 'keyword', '').lower()

    try:
        query = db.session.query(
            RadlexNameMapping.id, RadlexNameMapping.tag_type,
            RadlexNameMapping.src, RadlexNameMapping.dst
        )
        if keyword != '':
            likeExpression = '%{}%'.format(keyword)
            query = query.filter(or_(
                RadlexNameMapping.src.like(likeExpression),
                RadlexNameMapping.dst.like(likeExpression)
            ))

        offset = (page - 1) * pageSize
        total = query.count()
        rows = query.order_by(RadlexNameMapping.id).offset(offset).limit(pageSize).all()
        items = ['id', 'tag_type', 'src', 'dst']
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
            'message': 'get radlex mapping list failed'
        }
    return rst


def createOne(db, args):
    data = args['data']
    try:
        record = RadlexNameMapping(
            tag_type=data['tag_type'],
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
            'message': 'create radlex mapping failed'
        }
    return rst


def getOne(db, part_id):
    try:
        record = db.session.query(
            RadlexNameMapping.id, RadlexNameMapping.tag_type,
            RadlexNameMapping.src, RadlexNameMapping.dst
        ) \
            .filter(RadlexNameMapping.id == part_id) \
            .first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'get radlex mapping one failed, not exist'
            }
        else:
            items = ['id', 'tag_type', 'src', 'dst']
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
            'message': 'get radlex mapping one failed'
        }
    return rst


def updateOne(db, args, part_id):
    data = args['data']
    try:
        record = db.session.query(RadlexNameMapping).filter(RadlexNameMapping.id == part_id).first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'update radlex mapping one failed, not exist'
            }
        else:
            items = ['tag_type', 'src', 'dst']
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
            'message': 'update radlex mapping one failed'
        }
    return rst


def deleteOne(db, part_id):
    try:
        record = db.session.query(RadlexNameMapping).filter(RadlexNameMapping.id == part_id).first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'delete radlex mapping one failed, not exist'
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
            'message': 'delete radlex mapping one failed'
        }
    return rst
