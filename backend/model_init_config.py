from exam_standard.init_func import init_exam_standard_processor, init_jwt_manager, init_normalization_processor
from demo.init_demo import init_demo

# init_global中，要把初始化的model都放在这里(比如exam_standard, demo)
global_init_func_dict = {
    "exam_standard": [init_jwt_manager, init_exam_standard_processor, init_normalization_processor],
    "demo": [init_demo]
}
