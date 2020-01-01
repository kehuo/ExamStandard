import traceback
from flask_sqlalchemy import SQLAlchemy
import pymysql
pymysql.install_as_MySQLdb()


def init_db(app, global_var):
    app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://%s:%s@%s:%s/%s" % (
        app.config["DB_USER"],
        app.config["DB_PASSWORD"],
        app.config["DB_HOST"],
        app.config["DB_PORT"],
        app.config["DB_NAME"]
    )

    try:
        db = SQLAlchemy(app)
        global_var["db"] = db
    except Exception as e:
        traceback.print_exc()

    return
