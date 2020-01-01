import traceback
from sqlalchemy import or_
from bb_logger.logger import Logger
from common.utils.db import build_rows_result, build_general_filter, update_record, build_one_result
from common.utils.http import getValueWithDefault
from db_models.db_models import SnomedCtEntity, SnomedCtEntityRelationship, SnomedCtEntitySynonym
from demo.snomed_ct_cnst import RELATION_SHIP_DICT


def getList(db, args):
    keyword = getValueWithDefault(args, 'keyword', None)
    page = getValueWithDefault(args, 'page', 1)
    pageSize = getValueWithDefault(args, 'pageSize', 1000)
    parentCode = getValueWithDefault(args, 'parent', None)

    try:
        query = db.session.query(
            SnomedCtEntity.id, SnomedCtEntity.en_name, SnomedCtEntity.cn_name,
            SnomedCtEntity.code, SnomedCtEntity.is_leaf
        )

        if not keyword is None and keyword != '':
            query = query.filter(or_(SnomedCtEntity.cn_name.contains(keyword),
                                     SnomedCtEntity.en_name.contains(keyword)
                                     ))
        if not parentCode is None and parentCode != '':
            IS_A_TYPE = RELATION_SHIP_DICT['Is a (attribute)']['code']
            codeAll = db.session.query(SnomedCtEntityRelationship.source_code) \
                    .filter(SnomedCtEntityRelationship.type_code == IS_A_TYPE,
                            SnomedCtEntityRelationship.destination_code == parentCode) \
                    .all()
            childCodes = []
            if not codeAll is None:
                childCodes = [x[0] for x in codeAll]
            query = query.filter(SnomedCtEntity.code.in_(childCodes))

        offset = (page - 1) * pageSize
        total = query.count()
        rows = query.order_by(SnomedCtEntity.id).offset(offset).limit(pageSize).all()
        items = ["id", "en_name", "cn_name", "code", "is_leaf"]
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
            'message': 'get SNOMED-CT list failed'
        }
    return rst


def getOne(db, caseId):
    try:
        record = db.session.query(
            SnomedCtEntity.id, SnomedCtEntity.en_name, SnomedCtEntity.cn_name,
            SnomedCtEntity.code, SnomedCtEntity.is_leaf
        ) \
            .filter(SnomedCtEntity.id == caseId) \
            .first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'get SNOMED-CT one failed, not exist'
            }
            return rst

        items = ["id", "en_name", "cn_name", "code", "is_leaf"]
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
            'message': 'get SNOMED-CT one failed'
        }
    return rst

def updateOne(db, args, caseId):
    data = args['data']
    try:
        record = db.session.query(SnomedCtEntity).filter(SnomedCtEntity.id == caseId).first()

        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'update SNOMED-CT one failed, not exist'
            }
            return rst

        items = ["code", "en_name", "cn_name", "is_leaf"]
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
            'message': 'update SNOMED-CT one failed'
        }
    return rst


def getOneByCode(db, code):
    try:
        record = db.session.query(
            SnomedCtEntity.id, SnomedCtEntity.en_name, SnomedCtEntity.cn_name,
            SnomedCtEntity.code, SnomedCtEntity.is_leaf
        ) \
            .filter(SnomedCtEntity.code == code) \
            .first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'get SNOMED-CT one failed, not exist'
            }
            return rst

        items = ["id", "en_name", "cn_name", "code", "is_leaf"]
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
            'message': 'get SNOMED-CT one failed'
        }
    return rst
