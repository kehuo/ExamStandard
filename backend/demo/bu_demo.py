import traceback
import json
from sqlalchemy import func
from bb_logger.logger import Logger
from common.utils.db import build_rows_result, build_general_filter, update_record, build_one_result
from db_models.db_models import ReportTaggingSamples

import demo.pack_utils as packUtils
import demo.kidney_utils as KidneyUtils

TypeNameMap = {
    'kidney': '肾病理报告'
}


def demoList(db, args):
    typeName = args.get('demoType', '')
    try:
        query = db.session.query(
            ReportTaggingSamples.uuid, ReportTaggingSamples.type, ReportTaggingSamples.diagnosis
        )

        if not typeName is None and typeName != '':
            query = query.filter(ReportTaggingSamples.type == typeName)
        query = query.order_by(ReportTaggingSamples.id)

        total = query.count()
        rows = query.all()
        items = ['uuid', 'type', 'diagnosis']
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
            'message': 'get demo list failed'
        }
    return rst


def getRecord(db, caseId):
    if caseId == '':
        rst = {
            'code': 'FAILURE',
            'errMsg': 'get case failed'
        }
        return rst

    try:
        record = db.session.query(
            ReportTaggingSamples.id, ReportTaggingSamples.uuid, ReportTaggingSamples.type,
            ReportTaggingSamples.diagnosis, ReportTaggingSamples.diagnosis_tag,
            ReportTaggingSamples.content, ReportTaggingSamples.content_tag,
            func.date_format(ReportTaggingSamples.created_at, "%Y-%m-%d"),
            func.date_format(ReportTaggingSamples.updated_at, "%Y-%m-%d")
        ) \
            .filter(ReportTaggingSamples.uuid == caseId) \
            .first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'errMsg': 'get tagging task not exist'
            }
        else:
            items = ['id', 'uuid', 'type', 'diagnosis', 'diagnosis_tag',
                     'content', 'content_tag', 'created_at', 'updated_at']
            data = build_one_result(record, items)
            rst = {
                'code': 'SUCCESS',
                'data': data
            }
    except Exception as e:
        db.session.rollback()
        error = traceback.format_exc()
        Logger.service(error, 'error')
        rst = {
            'code': 'FAILURE',
            'errMsg': 'get tagging task failed'
        }
    return rst


def packContent(segments):
    # [['#0$1&symptom_obj*胸廓^#2$3&symptom_pos*两侧^', '#4$5&symptom_desc*对称^'],...]
    rst = []
    for segOne in segments:
        y = packUtils.normPack(segOne)
        if not y is None:
            rst.append(y)
    return rst


def packDiagnosis(segments):
    # [['#0$1&symptom_obj*胸廓^#2$3&symptom_pos*两侧^', '#4$5&symptom_desc*对称^'],...]
    rst = []
    for segOne in segments:
        if packUtils.isTagSeg(segOne, 'disease'):
            y = KidneyUtils.normKidneyDisease(segOne)
        else:
            y = packUtils.normPack(segOne)
        if not y is None:
            rst.append(y)
    return rst


def buildDemoResult(data, assembler):
    x = {}
    if data['diagnosis_tag'] != '' and not data['diagnosis_tag'] is None:
        x = json.loads(data['diagnosis_tag'])
    targetDiagnosis = x.get('entity', [])
    packUtils.adapt3to4Seg(targetDiagnosis, data['diagnosis'])
    diagnosis = {
        'input': {
            'text': data['diagnosis'],
        },
        'target': targetDiagnosis,
    }
    diagnosis_segments = assembler.run(diagnosis)
    data['diagnosis_lossless'] = packDiagnosis(diagnosis_segments)

    y = {}
    if data['content_tag'] != '' and not data['content_tag'] is None:
        y = json.loads(data['content_tag'])
    targetContent = y.get('entity', [])
    packUtils.adapt3to4Seg(targetContent, data['content'])
    content = {
        'input': {
            'text': data['content'],
        },
        'target': targetContent,
    }
    content_segments = assembler.run(content)
    data['content_lossless'] = packContent(content_segments)
    return


def demo(db, assembler, demoId):
    sampleRst = getRecord(db, demoId)
    if sampleRst['code'] != 'SUCCESS':
        return sampleRst

    data = sampleRst['data']
    buildDemoResult(data, assembler)
    rst = {
        'code': 'SUCCESS',
        'data': data
    }
    return rst
