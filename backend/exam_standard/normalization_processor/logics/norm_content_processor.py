from exam_standard.normalization_processor.logics.handle_radlex import handle_radlex
from exam_standard.normalization_processor.logics.handle_kidney import handle_kidney
from datetime import datetime

# 2019-12-16 因为目前肾病理的报告, 都会被 loinc 归一到 "刺激耐受类检测" class下, 故暂时先在该class下定义 handle_kidney.
# 若之后可以确认 肾病理的 loinc class, 在这里将 "刺激耐受类检测" 修改为正确的loinc class即可.
func_map = {
    "放射医学检查": {
        "radlex": {"func": handle_radlex,
                   "tree": "radlex"}
    },
    "刺激耐受类检测": {
        "kidney": {"func": handle_kidney,
                   "tree": "kidney"}
    },
    "凝血功能试验类": {
        "kidney": {"func": handle_kidney,
                   "tree": "kidney"}
    }
}


class NormContentProcessor(object):
    """
    在LOINC归一之后，继续用来归一具体内容的类
    如: 一个检查报告是 放射医学检查, 则该类用来将所有的 obj/exam/exam_item 都归一到 相应的tree上去(比如放射检查就归一到radlex)
    """

    def __init__(self, db, loinc_class, plan, radlex_tree, kidney_tree, radlex_cn_name_map, kidney_cn_name_map):
        """
        loinc_class: 放射医学检查, 或者其他类型

        plan: 根据processor_config.json中的 currently_used_plan字段，选择相应 归一方式.
        示例取值: plan = "radlex"
        说明: 比如放射医学检查的planA，就是radlex，之后若有planB，遇到放射医学检查时也可能不用radlex归一，而用planB的方式
        """
        self.db = db
        self.loinc_class = loinc_class
        self.plan = plan

        self.tree = {
            "radlex": radlex_tree,
            "kidney": kidney_tree
        }

        self.tree_cn_name_map = {
            "radlex": radlex_cn_name_map,
            "kidney": kidney_cn_name_map
        }
        return

    def run(self, standard_data):
        """
        主函数
        """
        res = []

        if self.loinc_class in func_map.keys():
            func = func_map[self.loinc_class][self.plan]["func"]
            tree_name = func_map[self.loinc_class][self.plan]["tree"]

            res = func(db=self.db,
                       standard_data=standard_data,
                       norm_tree=self.tree[tree_name],
                       tree_cn_name_map=self.tree_cn_name_map[tree_name]
                       )

        return res
