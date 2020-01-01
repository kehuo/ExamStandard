import exam_standard.exam_standard_processor.utils as Utils
from exam_standard.exam_standard_processor.logic.bu_process_seg_one import process_seg_one
from exam_standard.exam_standard_processor.init_stack import init_stack


class ExamStandardProcessor(object):
    """
    结构化拼接类.
    输入 processor_config.json 配置文件 (目前默认为空字典，若有需要，后续可增加)

    res_all: 100个样本结果的总和, 即所有 res_segments 之和
    res_segments: 1个样本中所有seg的结果总和, 即所有 res_seg 之和
    res_seg: 1个seg中所有结果之和
    source_json_data: load_source_json获得的初始数据
    """

    def __init__(self, config=None):
        if config:
            self.config = config

    def _slice_origin_target(self, source_data_one):
        """
        source_json_data: 即 goldset.json 文件
        source_data_one: 即 goldset.json 里的其中1条报告

        :return: 将一整段targets > 根据vector_seg > 分为几小段 segs
        """

        # 当输入的 target 是这样的时
        # 候, 需要解开以下注释: sample = [0, 1, "symptom_obj"]
        # 输入是这样的时候，不需要解开注释: [0, 1, "symptom_obj", "肝脏"]
        # text = source_data_one["input"]["text"]
        # source_data_one["target"] = list(map(lambda x: [x[0], x[1], x[2], text[x[0]:x[1] + 1]],
        #                                      source_data_one["target"]))

        sliced_targets = []
        if len(source_data_one["target"]) > 0:
            sliced_targets = Utils.slice_target(source_data_one["target"])

        return sliced_targets

        # 以下几行在做肾病理excel时，会临时用到
        # sliced_targets = []
        # if len(source_data_one["light_microscopy_target"]) > 0:
        #     sliced_targets = Utils.slice_target(source_data_one["light_microscopy_target"])

        # return sliced_targets

    def _process_seg_one(self, seg, text):
        """
        该函数用来处理 segment 中的每一个子 seg
        :param seg: slice_targets 中的 每一个子seg
        :param text: 检查报告的 原文本: "双肾大小正常，形态清晰..."
        :return: res_seg: 用来存储该seg中所有拼接好的结果
        """

        stack = init_stack()
        res_seg = process_seg_one(seg, text, stack)

        return res_seg

    def run(self, source_data_one):
        """
        主函数, 处理1条检查报告(即一个segments)

        输入的结构: 和goldset.json 每一条数据一样: {"input": {"text": "xxxx"}, "target":[] }
        :return: res_segments
        """

        segments = self._slice_origin_target(source_data_one)
        text = source_data_one["input"]["text"]

        res_segments = []
        if len(segments) > 0:
            for seg in segments:
                res_seg = self._process_seg_one(seg, text)
                res_segments.extend(res_seg)
                res_seg = []
        else:
            print("异常", source_data_one["id"])
        return res_segments

        # 以下几行在做肾病理excel时，会临时用到
        # segments = self._slice_origin_target(source_data_one)
        # text = source_data_one["input"]["light_microscopy_text"]
        #
        # res_segments = []
        # if len(segments) > 0:
        #     for seg in segments:
        #         res_seg = self._process_seg_one(seg, text)
        #         res_segments.extend(res_seg)
        #         res_seg = []
        # else:
        #     print("segment为空: ", source_data_one["id"])
        # return res_segments
