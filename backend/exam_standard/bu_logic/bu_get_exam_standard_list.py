import traceback
from sqlalchemy import or_
from db_models.db_models import ReportTaggingSamples
from common.utils.http import getValueWithDefault
from common.utils.db import build_rows_result


def get_exam_standard_list(db, args):
    """
    现在用 exam_tagging_samples 表
    支持用keyword关键词过滤 类型/内容
    """
    keyword = getValueWithDefault(args, 'keyword', None)
    page = getValueWithDefault(args, 'page', 1)
    pageSize = getValueWithDefault(args, 'pageSize', 1000)

    try:
        query = db.session.query(
            ReportTaggingSamples.id, ReportTaggingSamples.content, ReportTaggingSamples.type
        )

        # 1 用keyword过滤一次 (注意, 目前测试，只能用.contains方法过滤，而不能用.like方法。)
        # 参考文档: https://blog.csdn.net/weixin_41829272/article/details/80609968
        if keyword is not None:
            query = query.filter(or_(ReportTaggingSamples.content.contains(keyword),
                                     ReportTaggingSamples.type.contains(keyword)))

        # 2 用 page 和 pageSize 分页
        offset = (page - 1) * pageSize
        total = query.count()
        rows = query.order_by(ReportTaggingSamples.id).offset(offset).limit(pageSize).all()
        items = ["id", "content", "type"]
        data = build_rows_result(rows, items)

        rst = {
            "code": "SUCCESS",
            "data": {
                "total": total,
                "exam_reports": data
            }
        }
    except Exception as e:
        traceback.print_exc()
        rst = {
            "code": "FAILURE",
            "message": "Get exam report list failed. %s" % str(e)
        }

    return rst
