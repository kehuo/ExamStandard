import traceback
from db_models.db_models import User
from common.utils.db import build_one_result
from exam_standard.utils import encrypt_password


def login(db, args):
    try:
        # 1 根据username找到用户
        record = db.session.query(User) \
            .filter(User.name == args['userName']) \
            .filter(User.disabled == 0).first()
        if record is None:
            rst = {
                'code': 'FAILURE',
                'message': 'get user one failed, not exist'
            }
        else:
            # 2 核对用户的密码
            record = db.session.query(
                User.id, User.name, User.fullname, User.email, User.disabled, User.role_id) \
                .filter(User.name == args['userName']) \
                .filter(User.password == encrypt_password(args['password'])).first()
            if record is None:
                rst = {
                    "code": "FAILURE",
                    "message": "Incorrect Password"
                }
            else:
                # 如果核对无误, 则返回信息
                items = ['id', 'name', 'fullname', 'email', 'disabled', 'role_id']
                data = build_one_result(record, items)
                rst = {
                    'code': 'SUCCESS',
                    'data': data
                }
    except Exception as e:
        traceback.print_exc()
        rst = {
            'code': 'FAILURE',
            'message': 'Failed: %s' % str(e)
        }
    return rst


def logout(db, args):
    # TODO
    rst = {
        'code': 'SUCCESS',
        'data': args['id']
    }
    return rst
