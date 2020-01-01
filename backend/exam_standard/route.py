from exam_standard.serve import LogIn, CurrentUser, ExamStandardList, ExamStandardOne, AddExamReport, OnlyLossless
from common.utils.http import app_url


def exam_standard_route(api, version, model):
    # 登陆
    api.add_resource(LogIn, app_url(version, model, '/login'))

    # 获取当前用户
    api.add_resource(CurrentUser, app_url(version, model, '/currentUser'))

    # 获取数据库中 所有检查报告的结果列表
    api.add_resource(ExamStandardList, app_url(version, model, "/exam_report_list"))

    # 结构化
    api.add_resource(ExamStandardOne, app_url(version, model, '/exam_standard_one'))

    # 向数据库添加检查报告
    api.add_resource(AddExamReport, app_url(version, model, "/add_report"))
    # 只做lossless 结构化
    api.add_resource(OnlyLossless, app_url(version, model, "/only_lossless"))
    return
