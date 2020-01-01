from exam_standard.normalization_processor.logics.norm import norm_main


class Normalizer(object):
    """
    归一化类, 主函数为 run 方法
    输入:结构化结果
    输出:归一结果 (LOINC / RadLex / ...)
    """

    def __init__(self, db, required_data_dict=None, config=None):
        """
        config: 即 ./processor_config.json 文件中的内容
        required_data_dict 是函数所需的一些数据, 包括以下:
        主数据树:
        1 loinc_tree: LOINC 标准字典
        2 radlax_tree: RadLex 放射检查标准字典

        人造映射表:
        1 loinc_norm_map_step_0: LOINC归一的第一步会用到的字典
         --> 要是用此映射表，前提是输入的数据中，有"exam_class"字段，也就是映射表中的 key (value就是映射到LOINC tree中的结果)
         --> 若hit, 直接获得唯一 LOINC NUM (从映射到的loinc system列表中默认取第一条)

        2 loinc_obj_map: 将原始报告的文字，规范化成LOINC中可以搜索的到的统一写法
         --> 如: 原始obj文本是"肝"， 通过映射规范化后为"肝脏", "肝脏"可以从LOINC中搜索，做进一步归一

        3 radlex_cn_name_map: RadLex预映射字典
         --> 若hit, 直接获取当前tag 对应的 radlex ID
        """
        self.config = config if config else None

        # 等 db 操作稳定后, 可删除 required_data_dict 该属性.
        self.required_data_dict = {
            "loinc_tree": None,
            "radlex_tree": None,
            "loinc_norm_map_step_0": None,
            "loinc_obj_map": None,
            "radlex_cn_name_map": None,
            "kidney_tree": None,
            "kidney_cn_name_map": None
        }
        if required_data_dict:
            self.required_data_dict = required_data_dict
        self.db = db
        return

    def run(self, standard_data_one):
        """
        主函数
        输入:
        standard_data_one: 是esp结构化出来的结果
        standard_data_one = {
            "id": xxx,
            "exam_class": "",
            "text": "",
            "target": [],
            "res": []
        }
        其中， res是esp结构化的结果

        输出: 映射到LOINC / Radlex 的归一化结果 norm_res
        """

        norm_res = norm_main(db=self.db,
                             standard_data=standard_data_one,
                             required_data_dict=self.required_data_dict,
                             config=self.config)
        return norm_res
