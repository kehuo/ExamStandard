import json
from flask import Response
from flask_restful import reqparse, Resource

from common.utils.http import encoding_resp_utf8
from app.init_global import global_var
import demo.bu_demo as KidneyUtils
from exam_standard.utils import check_permission


class DemoList(Resource):
    @check_permission([1, 2, 3])
    def get(self, **auth):
        parser = reqparse.RequestParser()
        parser.add_argument('demoType', type=str, required=False, location='args')
        args = parser.parse_args()

        db = global_var["db"]
        res = KidneyUtils.demoList(db, args)

        return encoding_resp_utf8(res)

class DemoOne(Resource):
    @check_permission([1, 2, 3])
    def get(self, demoId, **auth):
        parser = reqparse.RequestParser()
        args = parser.parse_args()

        db = global_var["db"]
        assembler = global_var["exam_standard_processor"]
        res = KidneyUtils.demo(db, assembler, demoId)

        return encoding_resp_utf8(res)

