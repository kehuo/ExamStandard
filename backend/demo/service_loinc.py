import json
from flask import Response
from flask_restful import reqparse, Resource

from common.utils.http import encoding_resp_utf8
from app.init_global import global_var
import demo.bu_loinc as Utils
from exam_standard.utils import check_permission


class LoincList(Resource):
    @check_permission([1, 2, 3])
    def get(self, **auth):
        parser = reqparse.RequestParser()
        parser.add_argument('page', type=int, required=False, location='args')
        parser.add_argument('pageSize', type=int, required=False, location='args')
        parser.add_argument('keyword', type=str, required=False, location='args')
        args = parser.parse_args()

        db = global_var["db"]
        res = Utils.getList(db, args)

        return encoding_resp_utf8(res)

class LoincOne(Resource):
    @check_permission([1, 2, 3])
    def get(self, itemId, **auth):
        parser = reqparse.RequestParser()
        args = parser.parse_args()

        db = global_var["db"]
        res = Utils.getOne(db, itemId)

        return encoding_resp_utf8(res)

    @check_permission([1, 2, 3])
    def put(self, itemId, **auth):
        parser = reqparse.RequestParser()
        parser.add_argument('data', type=dict, required=True, location='json')
        args = parser.parse_args()

        db = global_var["db"]
        rst = Utils.updateOne(db, args, itemId)
        return encoding_resp_utf8(rst)