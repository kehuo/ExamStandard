import json
from flask import Response
from flask_restful import reqparse, Resource

from common.utils.http import encoding_resp_utf8
from app.init_global import global_var
import demo.bu_rare_disease as Utils
from exam_standard.utils import check_permission


class RamdisList(Resource):
    @check_permission([1, 2, 3])
    def get(self, **auth):
        parser = reqparse.RequestParser()
        parser.add_argument('page', type=int, required=False, location='args')
        parser.add_argument('pageSize', type=int, required=False, location='args')
        parser.add_argument('keyword', type=str, required=False, location='args')
        parser.add_argument('confidence', type=str, required=False, location='args')
        args = parser.parse_args()

        db = global_var["db"]
        res = Utils.getCaseList(db, args)

        return encoding_resp_utf8(res)

class RamdisOne(Resource):
    @check_permission([1, 2, 3])
    def get(self, caseId, **auth):
        parser = reqparse.RequestParser()
        args = parser.parse_args()

        db = global_var["db"]
        res = Utils.getCaseOne(db, caseId)

        return encoding_resp_utf8(res)

    @check_permission([1, 2, 3])
    def put(self, caseId, **auth):
        parser = reqparse.RequestParser()
        parser.add_argument('data', type=dict, required=True, location='json')
        args = parser.parse_args()

        db = global_var["db"]
        rst = Utils.updateCaseOne(db, args, caseId)
        return encoding_resp_utf8(rst)
