#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
from gunicorn.app.base import Application, Config
import gunicorn
from gunicorn import glogging
from gunicorn.workers import sync
from app.app import app
class GUnicornFlaskApplication(Application):
    def __init__(self, app):
        self.usage, self.callable, self.prog, self.app = None, None, None, app
    def run(self, **options):
        self.cfg = Config()
        [self.cfg.set(key, value) for key, value in options.items()]
        return Application.run(self)
    load = lambda self: self.app
if __name__ == "__main__":
    server_env = {
        'workers': ['WORKERS', 1],
        'worker_connections': ['WORKER_CONNECTIONS', 1],
        'worker_class': ['WORKER_CLASS', 'gunicorn.workers.sync.SyncWorker'],
        'bind': ['BIND', 'localhost:5000'],
        'timeout': ['TIMEOUT', 300]
    }
    env_dict = os.environ
    opts = {}
    for k, v in server_env.items():
        opts.setdefault(k, env_dict.get(v[0], v[1]))
    print('server start options:')
    for k, v in opts.items():
        print('{}: {}'.format(k, v))
    gunicorn_app = GUnicornFlaskApplication(app)
    gunicorn_app.run(**opts)