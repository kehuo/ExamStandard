import traceback
from common.utils.db import build_one_result
from db_models.db_models import User


def getCurrentUser(db, user_name):
    """
    当前登陆用户的信息
    """
    try:
        record = db.session.query(
            User.id, User.name, User.fullname, User.email, User.disabled, User.role_id) \
            .filter(User.name == user_name) \
            .first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'get user one failed, not exist'
            }
        else:
            items = ['id', 'name', 'fullName', 'email', 'disabled', 'roleId']
            data = build_one_result(record, items)
            rst = {
                'code': 'SUCCESS',
                'data': data
            }
    except Exception as e:
        traceback.print_exc()
        rst = {
            'code': 'FAILURE',
            'message': 'Failed'
        }
    return rst
