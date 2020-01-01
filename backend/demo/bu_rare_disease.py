import traceback
from bb_logger.logger import Logger
from common.utils.db import build_rows_result, build_general_filter, update_record, build_one_result
from common.utils.http import getValueWithDefault
from db_models.db_models import RamdisCases


def getCaseList(db, args):
    keyword = getValueWithDefault(args, 'keyword', None)
    page = getValueWithDefault(args, 'page', 1)
    pageSize = getValueWithDefault(args, 'pageSize', 1000)
    confidence = getValueWithDefault(args, 'confidence', None)

    try:
        query = db.session.query(
            RamdisCases.id, RamdisCases.patient_id, RamdisCases.diagnosis,
            RamdisCases.diagnosis_confirmed, RamdisCases.found_in_newborn,
            RamdisCases.country, RamdisCases.confidence
        )

        if not keyword is None and keyword != '':
            query = query.filter(RamdisCases.diagnosis.contains(keyword))
        if not confidence is None and confidence != '':
            query = query.filter(RamdisCases.confidence == confidence)

        offset = (page - 1) * pageSize
        total = query.count()
        rows = query.order_by(RamdisCases.id).offset(offset).limit(pageSize).all()
        items = ["id", "patient_id", "diagnosis", "diagnosis_confirmed", "found_in_newborn",
                 "country", "confidence"]
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
            'message': 'get ramdis list failed'
        }
    return rst


def getCaseOne(db, caseId):
    try:
        record = db.session.query(
            RamdisCases.id, RamdisCases.patient_id, RamdisCases.cn_context,
            RamdisCases.confidence, RamdisCases.memo
        ) \
            .filter(RamdisCases.id == caseId) \
            .first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'get ramdis one failed, not exist'
            }
        else:
            items = ['id', 'patient_id', 'cn_context', 'confidence', 'memo']
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
            'message': 'get ramdis one failed'
        }
    return rst


def updateCaseOne(db, args, caseId):
    data = args['data']
    try:
        record = db.session.query(RamdisCases).filter(RamdisCases.id == caseId).first()

        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'update ramdis one failed, not exist'
            }
        else:
            items = ['cn_context', 'confidence', 'memo']
            update_record(record, items, data)

            # db.session.add(record)
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
            'message': 'update ramdis one failed'
        }
    return rst
