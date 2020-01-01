from flask import json, Response


def app_url(version, model, name):
    name = '/{}/{}{}'.format(version, model, name)
    return name


def encoding_resp_utf8(data):
    json_response = json.dumps(data, ensure_ascii=False)
    response = Response(json_response, content_type="application/json; charset=utf-8")
    return response


def getValueWithDefault(aMap, key, defaultVal=None):
    v = aMap.get(key, defaultVal)
    if v is None:
        v = defaultVal
    return v
