from db_models.db_models import ReportTaggingSamples
import json


# def add_new_exam_report(args, global_var):
#     data = args["data"]
#     db = global_var["db"]
#     try:
#         record = ExamReport(
#             org_code=data["org_code"],
#             dept_code=data["dept_code"],
#             operator=data["operator"],
#             visit_id=data["visit_id"],
#             patient_id=data["patient_id"],
#             exam_type=data["exam_type"],
#             exam_code=data["exam_code"],
#             items=data["items"]
#         )
#         db.session.add(record)
#         db.session.commit()
#         res = {
#             "code": "SUCCESS",
#             "data": {"id": record.id}
#         }
#     except Exception as e:
#         res = {
#             "code": "FAILURE",
#             "message": str(e)
#         }
#     return res

def add_new_exam_report(args, global_var):
    # args["data"] = goldset.json 的一条记录
    data = args["data"]
    db = global_var["db"]

    # 将data["target"] 处理成 {"entity": [...]}的格式
    content_tag = {"entity": []}
    for i in data["target"]:
        if len(i) == 3:
            content_tag["entity"].append(i)
        elif len(i) == 4:
            i.pop()
            content_tag["entity"].append(i)

    content_tag = json.dumps(content_tag, ensure_ascii=False)

    try:
        record = ReportTaggingSamples(
            content=data["input"]["text"],
            content_tag=content_tag
        )
        db.session.add(record)
        db.session.commit()
        res = {
            "code": "SUCCESS",
            "data": {"id": record.id}
        }
    except Exception as e:
        res = {
            "code": "FAILURE",
            "message": str(e)
        }
    return res

