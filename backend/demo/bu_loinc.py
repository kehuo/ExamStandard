import traceback
from sqlalchemy import or_
from bb_logger.logger import Logger
from common.utils.db import build_rows_result, update_record, build_one_result
from common.utils.http import getValueWithDefault
from db_models.db_models import Loinc


def getList(db, args):
    keyword = getValueWithDefault(args, 'keyword', None)
    page = getValueWithDefault(args, 'page', 1)
    pageSize = getValueWithDefault(args, 'pageSize', 1000)

    try:
        query = db.session.query(
            Loinc.id, Loinc.class_x, Loinc.system, Loinc.component,
            Loinc.scale_typ, Loinc.method_typ, Loinc.property,
            Loinc.loinc_number, Loinc.time_aspect
        )

        if not keyword is None and keyword != '':
            query = query.filter(or_(Loinc.class_x.contains(keyword),
                                     Loinc.system.contains(keyword),
                                     Loinc.method_typ.contains(keyword),
                                     Loinc.component.contains(keyword)
                                     ))

        offset = (page - 1) * pageSize
        total = query.count()
        rows = query.order_by(Loinc.id).offset(offset).limit(pageSize).all()
        items = ["id", "class_x", "system", "component", "scale_typ", "method_typ",
                 "property", "loinc_number", 'time_aspect']
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
            'message': 'get Loinc list failed'
        }
    return rst


def getOne(db, caseId):
    try:
        record = db.session.query(
            Loinc.id, Loinc.class_x, Loinc.system, Loinc.component,
            Loinc.scale_typ, Loinc.method_typ, Loinc.property,
            Loinc.loinc_number, Loinc.time_aspect
        ) \
            .filter(Loinc.id == caseId) \
            .first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'get Loinc one failed, not exist'
            }
        else:
            items = ["id", "class_x", "system", "component", "scale_typ", "method_typ",
                 "property", "loinc_number", 'time_aspect']
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
            'message': 'get Loinc one failed'
        }
    return rst


def updateOne(db, args, caseId):
    data = args['data']
    try:
        record = db.session.query(Loinc).filter(Loinc.id == caseId).first()

        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'update Loinc one failed, not exist'
            }
        else:
            items = ["class_x", "system", "component", "scale_typ", "method_typ",
                 "property", "loinc_number", 'time_aspect']
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
            'message': 'update Loinc one failed'
        }
    return rst
