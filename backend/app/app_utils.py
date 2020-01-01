import errno
import sys
import getopt


# 读取 service.conf 配置文件
def load_config(app, filename, silent=False):
    try:
        with open(filename, 'r', encoding='utf-8') as config_file:
            exec (compile(config_file.read(), filename, 'exec'), app.config.__dict__)
    except IOError as e:
        if silent and e.errno in (errno.ENOENT, errno.EISDIR):
            return False
        e.strerror = 'Unable to load configuration file (%s)' % e.strerror
        raise
    for key in dir(app.config):
        if key.isupper():
            app.config[key] = getattr(app.config, key)
    return True


def get_service_config():
    config_file = './service.conf'
    opts, args = getopt.getopt(sys.argv[1:], "hc:")
    for op, value in opts:
        if op == "-c":
            config_file = value
            break
    return config_file
