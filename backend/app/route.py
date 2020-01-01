from app.init_global import global_var
from model_route_config import route_init_func


models = global_var['models']
model_func_map = []


def init_route(api, api_version):
    """
    model = "exam_standard", 写在service.conf中
    route_init_func = {"exam_standard": exam_standard_route}
    func = ["exam_standard", exam_standard_route]

    运行的时候: exam_standard_route(api, api_version, "exam_standard")
    """

    for model in models:
        func = route_init_func.get(model, None)
        if func is None:
            print('failed to get model function')
            continue
        model_func_map.append([model, func])
    # init model route
    for func in model_func_map:
        func[1](api, api_version, func[0])
    return
