from exam_standard.normalization_processor.logics.handle_loinc import handle_loinc
from exam_standard.normalization_processor.logics.norm_content_processor import NormContentProcessor


def norm_main(db, standard_data, required_data_dict, config):
    """
    主函数 - 归一 LOINC / Radlex / 其他可能的标准( 2019-11-28 目前只有2个标准)

    输入:
    required_data_dict: 5份数据(2棵tree + 2个loinc map + 1个 radlex map)
    config: 即 normalization_processor/processor_config.json 文件中的内容.

    *** 2019-11-07 周四 注:
    loinc_norm_map_step_0 参数，就是LOINC第一步过滤所使用的map.
    假设输入的standard_data中会有新加一个 "exam_class"字段，意思是"检查报告的类型", 比如"肝脏^超声检查" 或 "颅骨^X射线检查"

    流程:
    归一主要分为2个阶段
        >> 第一阶段是LOINC归一.
        >> 第二阶段是根据LOINC归一的结果，判断是否做"内容归一"(比如RadLex归一), 或者不做(因为目前没有相关标准).

    1 LOINC 归一
        1.1 假设输入的数据有 "exam_class" 字段
        1.2 基于假设, 通过 loinc_norm_map_step_0 映射 LOINC 结果
            --> 若映射成功, 则获得 loinc_class 值 = "放射医学检查"
            --> 若失败（即映射表中暂时没有这个 exam_class）:
                a. 可以考虑在映射表中加入这个 exam_class
                b. 也可以用后面的逻辑，使用 obj_map 做归一
        1.3 最终得到 LOINC 归一的结果
        **注意: 结果中会有一个 class 字段 (即下文中提到的loinc_class)，他决定了是否做后面的 "内容归一"，以及用什么方式做.

    2 对每一个 LOINC 归一的结果:
        2.1 初始化最终结果 res_one, 并将 bb_extension 字段置为空列表 []
        2.2 根据 loinc_class, 在 supported_loinc_class_list 列表中查找是否有自己
            <1> 若有 --> 按照以下步骤做对应的 "内容归一" (比如radlex 归一)
                a. 实例化 "内容归一"的类: NormContentProcessor 之前, 所要做的准备工作:
                 >> 先根据 loinc_class, 从 config 中找到对应的类型 current_norm_class (比如 "放射医学检查" 类型)
                 >> 再从 current_norm_class 中, 获取currently_used_plan 值 (比如: "A", "B")
                 >> 再从 current_norm_class["plans"]中， 获取key为"A"的 plan的值 (即: "radlex")
                 >> 此时 plan = "radlex"
                 >> 最后 实例化时, 将plan也作为参数传入
                b. run
                 >> 通过传入的plan, 决定映射到哪个函数上进行归一 (参考 norm_content_processor.py 文件)
                 >> 比如 planA, 通过映射"radlex" --> 运行 handle_radlex 函数进行归一
                c. 将结果放入 res_one["bb_extension"]
            <2> 若没有 --> 目前不做这种 loinc_class 的内容归一(比如 SC$身高) --> 跳到 3

    3 将步骤2的res_one, 放入总的res
    以上基本流程结束.
    """

    # 目前 bb_extension 字段只支持 放射医学检查做radlex归一
    supported_loinc_class_list = list(config["supported_loinc_classes"].keys())

    res = []
    # 1 先归一loinc
    loinc_res_list = handle_loinc(db=db,
                                  standard_data=standard_data,
                                  loinc_tree=required_data_dict["loinc_tree"],
                                  loinc_obj_map=required_data_dict["loinc_obj_map"],
                                  loinc_norm_map_step_0=required_data_dict["loinc_norm_map_step_0"])

    # 2 再通过 loinc_class（如"放射医学检查"） 判断是否做 RadLex 归一
    for idx in range(len(loinc_res_list)):
        # 2.1 初始化最终结果 res, 并获取 loinc_class 的值
        res_one = {
            "id": idx,
            "loinc": loinc_res_list[idx],
            "narrative": standard_data["text"],
            "bb_extension": []
        }

        loinc_class = loinc_res_list[idx]["class"]

        # 2.2 根据 loinc_class 判断是否做 radlex 归一
        if loinc_class in supported_loinc_class_list:
            # a 实例化 "内容归一" 的类 (可根据config中的配置，选择使用哪种归一方式, 比如radlex或者其他)
            # a-1 获取config中 "放射医学检查" 的相关配置
            current_norm_class = config["supported_loinc_classes"][loinc_class]
            # a-2 获取配置中 "currently_used_plan" 字段的值 ("A")
            currently_used_plan = current_norm_class["currently_used_plan"]
            # a-3 根据上一步的值, 获取 plans 字段中相应的plan值, 即 "A" --> plan = "radlex"
            plan = current_norm_class["plans"][currently_used_plan]

            ncp = NormContentProcessor(db=db,
                                       loinc_class=loinc_class,
                                       plan=plan,
                                       radlex_tree=required_data_dict["radlex_tree"],
                                       kidney_tree=required_data_dict["kidney_tree"],
                                       radlex_cn_name_map=required_data_dict["radlex_cn_name_map"],
                                       kidney_cn_name_map=required_data_dict["kidney_cn_name_map"])
            # b run
            norm_content_res = ncp.run(standard_data)

            # c 放入res_one["bb_extension"]中
            res_one["bb_extension"] = norm_content_res

        # 3 放入最后结果
        res.append(res_one)
    return res
