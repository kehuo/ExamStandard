from exam_standard.exam_standard_processor.utils import connect


class Entity(object):
    """
    处理 pos / obj / part 3种标签的类
    complete: #0$1&symptom_obj*肝脏^
    etype: "symptom_obj"
    pre_pos: 挂载自己前置的 symptom_pos 的一个属性
    after_pos: 挂载后置 symptom_pos 的属性
    """
    def __init__(self, tag):
        self.complete = connect(tag)
        self.start_idx = tag[0]
        self.end_idx = tag[1]
        self.etype = tag[2]
        self.name = tag[3]
        self.children = []
        self.prepos = ""
        self.afterpos = ""
