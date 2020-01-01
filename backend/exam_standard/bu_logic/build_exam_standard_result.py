def build_exam_standard_result(esp, args):
    """
    1 esp = ExamStandardProcessor 类的一个实例化对象, 在init_model时启动
    2 args["data"] = {"input": {"text": ""},
                      "target": [...]}
    """

    exam_standard_res = {
        "exam_class": "",
        "text": args["data"]["input"]["text"],
        "target": args["data"]["target"],
        "res": esp.run(args["data"])
    }

    return exam_standard_res
