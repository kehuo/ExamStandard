def only_lossless(args, global_var):
    """
    args["data"] 格式和goldset.json一样:
    {"input":{"text": "xxxx}, "target": [[], []]}
    """
    # 结构化类的 实例
    esp = global_var["exam_standard_processor"]

    # 所需参数 text 和 target
    data = args["data"]
    text = data["input"]["text"]
    target = []
    for i in data["raw_target"]["entity"]:
        tmp = i
        tmp.append(text[i[0]:i[1] + 1])
        target.append(tmp)
    data["target"] = target
    # run
    res = esp.run(data)
    return res
