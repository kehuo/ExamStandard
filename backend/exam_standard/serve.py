import json
from flask import Response
from flask_restful import reqparse, Resource
from flask_jwt_extended import (create_access_token, get_jwt_identity, verify_jwt_in_request)

from common.utils.http import encoding_resp_utf8
from app.init_global import global_var
from exam_standard.bu_logic.bu_get_exam_standard_list import get_exam_standard_list
from exam_standard.bu_logic.bu_handle_exam_standard_one import handle_exam_standard_one
from exam_standard.bu_logic.add_new_exam_report import add_new_exam_report

# 以下部分为登陆使用
import exam_standard.bu_logic.bu_login as LoginUtils
from exam_standard.utils import check_permission
from exam_standard.bu_logic.bu_get_current_user import getCurrentUser

# 以下部分是 OnlyLossless api使用
from exam_standard.bu_logic.only_lossless import only_lossless


class LogIn(Resource):
    """
    登陆
    """
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('userName', type=str, required=True, location='json')
        parser.add_argument('password', type=str, required=True, location='json')
        args = parser.parse_args()
        rst = LoginUtils.login(global_var['db'], args)
        access_token = create_access_token(identity=args['userName'])
        resp = Response(json.dumps(rst, ensure_ascii=False), content_type="application/json; charset=utf-8")
        resp.set_cookie('_op_token_dv', access_token)
        resp.headers['x-bb-set-bauthtoken'] = access_token
        resp.headers['Access-Control-Expose-Headers'] = 'x-bb-set-bauthtoken'
        return resp


class LogOut(Resource):
    """
    登出
    """
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=str, required=True, location='json')
        args = parser.parse_args()
        rst = LoginUtils.logout(global_var['db'], args)
        return encoding_resp_utf8(rst)


class CurrentUser(Resource):
    """
    注意: 这里返回的验证失败的 errorCode: BAUTH_TOKEN_MISSING 不要轻易修改。
    因为不管是key: errorCode, 还是value: BAUTH_TOKEN_MISSING, 都是和前端对应的.
    比如, 若将errorCode改成 err_code, 或者将 BAUTH_TOKEN_MISSING 改成 TOKEN_FAILED, 会导致前端拿不到结果.
    """
    def get(self):
        try:
            verify_jwt_in_request()
        except Exception as e:
            print(e)
            # 这里的return结果，不要轻易修改.
            return {'errorCode': 'BAUTH_TOKEN_MISSING', 'errorMessage': '无效 access token'}, 401
            # return {'errorCode': 'Unauthorized Access Token', 'errorMessage': '无效的access token'}, 401
        current_user = get_jwt_identity()
        db = global_var['db']
        rst = getCurrentUser(db, current_user)

        return encoding_resp_utf8(rst)


class ExamStandardList(Resource):
    """
    获取数据库中所有 检查报告初始文本 的列表 (对应前端 exam-standard/show-exam-report-list 页面)
    """

    def get(self, **auth):
        parser = reqparse.RequestParser()
        parser.add_argument('page', type=int, required=False, location='args')
        parser.add_argument('pageSize', type=int, required=False, location='args')
        parser.add_argument('keyword', type=str, required=False, location='args')
        args = parser.parse_args()

        db = global_var["db"]
        res = get_exam_standard_list(db, args)

        return encoding_resp_utf8(res)


class ExamStandardOne(Resource):
    """
    对 其中一条 检查报告做对应的处理
    输入: 检查报告文本 存在数据库中的id (20191114xx)
    输出: 结构化 + 归一化的结果
    res= {"code": "SUCCESS",
          "data": {"exam_standard": {},
                   "norm": []}
        }
    """
    @check_permission([1, 2, 3, 4])
    def get(self, **auth):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=str, required=False, location='args')
        args = parser.parse_args()

        res = handle_exam_standard_one(args, global_var)

        return encoding_resp_utf8(res)


class AddExamReport(Resource):
    """
    后台管理api，向数据库 exam_report 表添加检查报告
    输入: 一条 goldset.json记录
    """
    @check_permission([1, 2, 3])
    def post(self, **auth):
        parser = reqparse.RequestParser()
        parser.add_argument("data", type=dict, required=False, location="json")
        args = parser.parse_args()
        res = add_new_exam_report(args, global_var)
        return encoding_resp_utf8(res)


class OnlyLossless(Resource):
    """
    后台管理api，测试exam_standard_processor 结构化效果
    """

    @check_permission([1, 2, 3])
    def post(self, **auth):
        parser = reqparse.RequestParser()
        parser.add_argument("data", type=dict, required=False, location="json")
        args = parser.parse_args()
        res = only_lossless(args, global_var)

        return encoding_resp_utf8(res)
