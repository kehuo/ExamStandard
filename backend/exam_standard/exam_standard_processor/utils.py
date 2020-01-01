import json
from datetime import datetime


# 读取json数据
def load_json_file(abs_file_name):
    result = []
    line_count = 0
    count = 0

    with open(abs_file_name, 'r', encoding='utf-8') as f:
        for line in f:
            line_count = line_count + 1
            if line_count % 1000 == 0:
                print('line --- {}'.format(line_count))
            try:
                dic = json.loads(line)
                result.append(dic)
                count = count + 1
            except Exception as e:
                print(e)
                print('error line: {}'.format(line))

    return result


# 分割初始文本
def slice_target(origin_target):
    if len(origin_target) == 0:
        return []

    """
    由于Tagging 模型的输入，可能由于序列长度seq_len 超过120， 而被break_x函数拆成2句话。
    而拆的过程中，很可能造成这种情况：
    导致一个句子的最后一个标签不是vector_seg (但是正常人工标注中，所有的输入的最后一个标签，都肯定是vector_seg)

    如果句子的最后一个标签不是 vector_seg，那么这个函数中就拿不到最后一个seg
    可能导致很多条结果拼不出来，因为这个函数中都拿不到这个seg。

    示例：
    原文本长度 135 （大于120）:
    text = '肝脏形态大小正常，包膜光滑，肝实质回声均匀，肝内管道结构显示清晰，血管走向分布正常。CDFI未见明显异常血流。
            脾形态大小正常，包膜光滑，实质回声均，未见明显异常回声。CDFI未见明显异常血流。胰腺形态大小正常，回声均匀，其内未见明显异常回声。
            双肾大小形态正常，包膜光滑，皮质回声均，锥体分布正常，集合系统未见明显分离。双肾内未见明显异常声像。
            CDFI检查双肾彩色血流分布正常，频谱未见明显异常。'


    这句文本会被break_x函数拆成多个短句子, 其中一个句子是:
    sub_text = "脾形态大小正常，包膜光滑，实质回声均，未见明显异常回声。"

    origin_target = [
    [[0, 1, 'symptom_obj', '肝脏'],
    [2, 3, 'exam_item', '形态'],
    [4, 5, 'exam_item', '大小'],
    [6, 7, 'exam_result', '正常'],
    [9, 10, 'object_part', '包膜'],
    [11, 12, 'symptom_desc', '光滑'],
    [13, 13, 'vector_seg', '，'],
    [14, 14, 'symptom_obj', '肝'],
    [15, 16, 'object_part', '实质'],
    [17, 18, 'exam_item', '回声'],
    [19, 20, 'exam_result', '均匀'],
    [21, 21, 'vector_seg', '，'],
    [22, 23, 'symptom_obj', '肝内'],
    [24, 25, 'object_part', '管道'],
    [26, 27, 'exam_item', '结构'],
    [28, 31, 'exam_result', '显示清晰'],
    [33, 34, 'object_part', '血管'],
    [35, 36, 'exam_item', '走向'],
    [37, 38, 'exam_item', '分布'],
    [39, 40, 'exam_result', '正常'],

    # 这里41是一个句号，但是没有标注为 vector_seg

    [42, 45, 'exam', 'CDFI'],
    [46, 51, 'reversed_exam_result', '未见明显异常'],
    [52, 53, 'reversed_exam_item', '血流'],
    [54, 54, 'vector_seg', '。'],
    [55, 55, 'symptom_obj', '脾'],
    [56, 57, 'exam_item', '形态'],
    [58, 59, 'exam_item', '大小'],
    [60, 61, 'exam_result', '正常'],
    [63, 64, 'object_part', '包膜'],
    [65, 66, 'symptom_desc', '光滑'],
    [68, 69, 'object_part', '实质'],
    [70, 71, 'exam_item', '回声'],
    [72, 72, 'exam_result', '均'],
    [74, 79, 'reversed_exam_result', '未见明显异常'],
    [80, 81, 'reversed_exam_item', '回声'],
    [83, 86, 'exam', 'CDFI'],
    [87, 92, 'reversed_exam_result', '未见明显异常'],
    [93, 94, 'reversed_exam_item', '血流'],
    [95, 95, 'vector_seg', '。'],

    其中, 第41个句号，在135长度的整句中，是没有标成vector_seg的，所以：
    ""脾形态大小正常，包膜光滑，实质回声均，未见明显异常回声。" 这一句话没有vector_seg, 所以在这个函数中会返回一个空结果

    为了避免这种现象，在函数最开始，会优先检查最后一项，如果不是 vector_seg, 那么人为加上 vector_seg
    """

    # origin_target 初始的标注
    # text: 原文本, "肾大小正常, 形态光整..."

    # 人为将最后一个写成vector_seg
    if origin_target[-1][2] != "vector_seg":
        origin_target[-1][2] = "vector_seg"

    idx = [0]
    for i in range(len(origin_target)):
        if origin_target[i][2] != "vector_seg":
            continue

        if i == 0:
            continue

        if i >= 1:
            if origin_target[i - 1][2] == "exam":
                if i >= 2:
                    # 原文本: 根据标准左手、腕的正位片，与女孩骨龄标准对比，尺骨茎突开始形成，该女孩的实际骨龄约为 6.5 岁。
                    # 遇到"正位片"则不切分
                    # [6, 6, 'symptom_pos', '左'],
                    # [7, 7, 'symptom_obj', '手'],
                    # [9, 9, 'symptom_obj', '腕'],
                    # [11, 13, 'exam', '正位片'],
                    # [24, 24, 'vector_seg', '，']
                    if origin_target[i-2][2] == "symptom_obj" or origin_target[i-2][2] == "vector_seg":
                        continue
                else:
                    # i = 1
                    # 原文: "急诊，餐后扫查，肠气干扰明显，图像质量欠佳: ...."
                    # [3, 6, 'exam', '餐后扫查'],
                    # [7, 7, 'vector_seg', '，'],
                    continue

            # 连续2个vector_seg, 2个都不分割
            # 原文: ""腹部急诊扫描，胃肠道未准备，大致观察。"
            # [0, 1, 'symptom_obj', '腹部'],
            # [2, 5, 'exam', '急诊扫描'],
            # [6, 6, 'vector_seg', '，'],
            # [18, 18, 'vector_seg', '。']
            elif origin_target[i - 1][2] == "vector_seg":
                continue

            # 其他情况正常分割
            idx.append(i)

    res = []
    for j in range(len(idx) - 1):
        res.append(origin_target[idx[j]:idx[j + 1]])

    # 剔除 seg 中的vector_seg标签
    # k = [[140, 140, 'vector_seg', '。'],
    #      [141, 141, 'symptom_obj', '心'],
    #      [142, 142, 'exam_item', '影'],
    #      [143, 146, 'exam_result', '始终较浓']
    #      ]
    for origin_seg_one in res:
        while True:
            if "vector_seg" not in [m[2] for m in origin_seg_one]:
                break

            else:
                for m in origin_seg_one:
                    if m[2] == "vector_seg":
                        m_idx = origin_seg_one.index(m)
                        origin_seg_one.pop(m_idx)
                        break

    return res


# 逐个打印 seg
def display_sliced_segments(idx, sliced_segments):
    print("\n第%d个标注:\n" % idx)
    for seg in sliced_segments:
        for s in seg:
            print(s)
        print("")


def get_sort_key(elem):
    start_idx = None
    end_idx = None
    
    # elem = ["#0$1&symptom_obj*肾"]
    for i in range(len(elem[-1]) - 1, -1, -1):
        if elem[-1][i] == "&":
            end_idx = i
        elif elem[-1][i] == "$":
            start_idx = i
            break

    return int(elem[-1][start_idx+1:end_idx])


def connect(t):
    """
    2019-11-25 注释: 因为有些检查报告中会有 星号*, 所以将星号改为 @
    """
    connected_str = ""

    try:
        # connected_str = "#" + str(t[0]) + "$" + str(t[1]) + "&" + str(t[2]) + "*" + str(t[3]) + "^"
        connected_str = "#" + str(t[0]) + "$" + str(t[1]) + "&" + str(t[2]) + "@" + str(t[3]) + "^"
    except IndexError:
        print("exam_standard_processor/utils.py/connect函数失败，出现问题的seg:%s,  " % t)

    return connected_str


def save_esp_res_all(data, res_all, save_path, save_name):
    """
    将 esp结构化 的所有结果 res_all 存储为 json
    因为Normalizer可能用到target,所以存储json的时候, 把target也写入结果中了
    """
    abs_file_name = save_path + save_name

    save_file = []
    for idx in range(len(data)):
        save_file.append(
            {
                "id": idx,
                "text": data[idx]["input"]["text"],
                "target": data[idx]["target"],
                "res": res_all[idx]
            }
        )

        # 以下结构, 在做肾病理报告时, 会临时用到
        # save_file.append(
        #     {
        #         "id": data[idx]["id"],
        #         "valid": data[idx]["valid"],
        #         "light_microscopy_text": data[idx]["input"]["light_microscopy_text"],
        #         "diagnostic_result_text": data[idx]["input"]["diagnostic_result_text"],
        #         "frozen_macroscopy_text": data[idx]["input"]["frozen_macroscopy_text"],
        #
        #         "light_microscopy_target": data[idx]["light_microscopy_target"],
        #         "diagnostic_result_target": data[idx]["diagnostic_result_target"],
        #         "res": res_all[idx]
        #     }
        # )

    with open(abs_file_name, "w") as f:
        for file_one in save_file:
            f.write(json.dumps(file_one, ensure_ascii=False) + "\n")
    return


def save_norm_res_all(norm_res_all, save_path):
    """
    将归一化结果结果存储为json
    """
    save_name = "result_%s.json" % datetime.now().strftime('%y-%m-%d_%I:%M:%S_%p')
    abs_file_name = save_path + save_name

    with open(abs_file_name, "w") as f:
        for each in norm_res_all:
            f.write(json.dumps(each, ensure_ascii=False) + "\n")
    return
