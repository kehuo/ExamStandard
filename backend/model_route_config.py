from exam_standard.route import exam_standard_route
from demo.demo_route import demo_route

# 在 app文件夹下的 route.py 中，会按照以下字典，对每一个model初始化所有route
route_init_func = {
    "exam_standard": exam_standard_route,
    'demo': demo_route
}
