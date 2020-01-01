from app.app import app
from flask_script import Manager, Server


def run_manage():
    manager = Manager(app)
    manager.add_command("runserver", Server(host=app.config['LISTEN'],
                                            port=app.config['PORT'],
                                            use_debugger=app.config['DEBUG']))
    manager.run()
    return


def main():
    run_manage()


if __name__ == '__main__':
    main()

"""
在app.py中，需要在init_global后面引入 init_route
否则init_route时会因为 global_var还没有初始化导致keyError.
"""