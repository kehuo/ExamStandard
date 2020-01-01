import sys
from exam_standard.exam_standard_processor.do_job_utils import Config, parse_args
from exam_standard.exam_standard_processor.job_func import exam_standard_func, normalize_func

# 该文件是需要将 exam_standard_processor 作为job 运行时的启动函数 (job.conf 是对应的配置文件), 运行方式:
# python do_job.py -c exam_standard/exam_standard_processor/job.conf

job_maps = {
    'exam_standard_job': exam_standard_func,
    "normalize_job": normalize_func
}


def do_job(cfg):
    """
    cfg = {'job': {'pipeline': 'exam_standard_job',
                   'exam_standard_job': 'exam_standard_func',
                   'normalize_job': 'normalize_func'},
           'exam_standard_job': {'source_json_file_path': './data/',
                                 'source_json_file_name': 'goldset_1009.json',
                                'result_save_path': './data/',
                                'esp_config': '[]'}},
           'normalize_job': {"loinc_tree_path": "./norm_data/filtered_loinc_tree.json",
                            "radlex_tree_path": "./"}
        }

    pipeline = "exam_standard_job,normalize_job"
    job = ['exam_standard_job', 'normalize_job']
    """

    pipeline = cfg.cfgMap['job']["pipeline"]
    jobs = pipeline.split(",")

    for job in jobs:
        print('{} starting ....'.format(job))
        job_cfg = cfg.cfgMap[job]
        job_maps[job](job_cfg)
        print('{} finished'.format(job))

    return


def main():
    ret, err_msg, options, args = parse_args()

    if ret != 0:
        print(err_msg)
        sys.exit(-1)

    cfg = Config(options.configFile)
    cfg.parse()
    print(cfg.cfgMap)

    do_job(cfg)

    return


if __name__ == '__main__':
    main()
