import traceback
import json
from exam_standard.normalization_processor.utils import restore_tag_one
from db_models.db_models import RadlexNameMapping, Radlex


def process_raw_cn_name(db, curr_tag, radlex_cn_name_map):
    """
    功能函数 的 子功能函数 -- 用预映射字典 radlex_cn_name_map, 将 raw_cn_name 值规范化
    在 build_radlex_res 函数中被调用
    如: 将raw_obj"肝" 规范为 processed_obj"肝脏"

    -------------------
    2019-11-25 更新: 以下是旧版本的注释 (新旧版本的区别，主要在于map字典的结构区别，和一些功能函数返回的数据结构的复杂程度的区别.)
    注意: tags 这个参数的作用：在某些情况下，需要检查当前cn_name的上下文
    tags = [
            [obj, 膀胱],
            [part, 壁]
        ]
    示例: 比如当前是obj_part"壁"，他要找上文的obj"膀胱"，共同组成"膀胱壁"，再去radlex归一.

    整体流程:
    1 输入 curr_tag = [2, 2, part, 壁]
    2 先统一设置 raw_cn_name = 壁
    3 因为是part > 特殊处理 > 找前项obj > 找到previous_tag = [0, 1, obj, 膀胱]
    4 拼一起，raw_cn_name = 膀胱壁
    5 用膀胱壁去 radlex_cn_name_map.json 预映射 > 如果能做，就获得standard预映射，作为res
    6 返回res （用来在后面的recursively_search函数中去radlex_tree.json 做归一)1

    ---------------------------
    以下是新版本的注释:
    **相比旧版本: <1> map字典更优化(先按照tag类型分类，比如symptom_obj/ exam_result 分开);
                <2> tag结构更浅，搜索更快

    新版的 radlex_cn_name_map_new = {
        "symptom_pos": {
            "<raw>": "<standard>"
            "右": "右侧",
            "上": "上册"
        },
        "exam_item": {
            "<raw>": "<standard>"
            "齿状的线条": "齿状线"
        }
    }
    输入: curr_tag = [7, 7, symptom_pos, 右]

    整体流程:
    1 raw_cn_name = curr_tag[3] = 右
    2 用 raw_tag_type "symptom_pos", 去 radlex_cn_name_map_new.json 做第一级预映射
        2.1 若能做 --> sub_map = radlex_cn_name_map_new[raw_tag_type] --> 跳到3
        2.2 不能做 --> res = raw_cn_name, 不再做后面的流程
    3 用 raw_cn_name "右", 在 sub_map 中做2级映射
        3.1 能做 --> res = sub_map[raw_cn_name] --> 结束，跳到4
        3.2 不能做 --> res = raw_cn_name

    4 返回res （用来在后面的recursively_search函数中去radlex_tree.json 做归一)1

    输出:
    res = radlex_cn_name_map["symptom_pos"]["右"] = "右侧"
    """

    raw_cn_name = curr_tag[3]
    raw_tag_type = curr_tag[2]

    # 2019-12-23 json 文件映射
    # # 1 先用 tag_type, 在 map 中做 level_1 映射, 得到2级map: sub_map
    # sub_map = radlex_cn_name_map[raw_tag_type] if raw_tag_type in radlex_cn_name_map.keys() else None
    #
    # # 如果sub_map 存在, 则在里面通过 raw_cn_name 进行 level_2 映射
    # level_2_res = None
    # if sub_map:
    #     level_2_res = sub_map[raw_cn_name]["cn_name"] if raw_cn_name in sub_map.keys() else None
    #
    # res = level_2_res if level_2_res is not None else raw_cn_name

    # db 映射
    res = raw_cn_name
    try:
        record = db.session.query(RadlexNameMapping) \
            .filter(RadlexNameMapping.tag_type == raw_tag_type) \
            .filter(RadlexNameMapping.src == raw_cn_name) \
            .first()

        if record:
            res = json.loads(record.dst)["cn_name"]
    except Exception as e:
        print("radlex cn name map failed: %s" % traceback.format_exc())

    return res


def recursively_search(data, tag_value):
    """
    功能函数 1 的 子功能函数 - 递归搜索 radlex tree, 找到tag可以对应的所有的项 (可能不止一个)
    在 search_radlex_id 函数中被调用
    以下 rid 本来没有cn_name, 已经修复
    RID6036 / RID12509 / RID27787 / RID48963 / RID474 / RID34583 / RID39166 / RID43628
    """

    if tag_value == data["cn_name"]:
        return data
    else:
        if "children" not in data.keys():
            return None
        else:
            for j in data["children"]:
                if recursively_search(j, tag_value) is not None:
                    return recursively_search(j, tag_value)


def search_radlex_id(db, radlex_tree, tag):
    """
    功能函数 1 - 输入cn_name, 搜索 radlex_id
    tag: 字符串, 没有经过 radlex_cn_name_map.json 规范化过的 raw_cn_name, 比如 tag = "正常"
    standard_tag: 经过map规范化过的cn_name, 可以在radlex找到归一的id, 比如"正常的"

    返回:
    <1> json文件搜索
    res = [
            {'cn_name': '否', 'en_name': 'False', 'parents': ['RID49833'], 'rid': 'RID49835'}
        ]

    <2> db 搜索
    res = [
            {'cn_name': '否', 'en_name': 'False', 'parents': ['RID49833'], 'rid': 'RID49835'}
    ]
    """
    # 2019-12-23 radlex_tree.json 文件搜索
    # res = []
    # for i in radlex_tree["children"]:
    #     each_res = recursively_search(i, tag)
    #     if each_res is not None:
    #         res.append(each_res)

    # db 搜索
    res = []
    record = db.session.query(Radlex).filter(Radlex.cn_name == tag).first()
    if record:
        res.append(
            {"cn_name": record.cn_name,
             "en_name": record.en_name,
             # 注意 parent_rid 要有方括号, 保持和 radlex tree 数据格式统一.
             "parents": [record.parent_rid],
             "rid": record.rid}
        )

    return res


def build_text_and_tags(data):
    """
    功能函数 2 - 主函数中被调用，用于构造最终返回的数据
    2019-11-25：以下输入输出，是针对新版本结构的。
    输入:
    data = ['#7$7&symptom_pos*右^#8$10&symptom_obj*上颌窦^',
            '#12$12&lesion_desc*一^',
            '#13$14&exam_item*大小^',
            '#15$26&exam_result*约16.8*10.3mm^',
            '#32$35&lesion*低密度灶^']

    输出:
    text = 右上颌窦一大小约16.8*10.3mm低密度灶

    restored_tag_list = [ [7, 7, symptom_pos, 右], [8, 10, symptom_obj, 上颌窦], [13, 14, exam_item,
    大小], [15, 26, exam_result, 约16.8*10.3mm^], [32, 35, lesion, 低密度灶] ]


    以下是旧版本的restored_tag_list结构，写在这里是为了和上面新版本的结构做对比，会比新版本多一层[], 处理更麻烦，但是有可能在某些
    特殊情况下，这种复杂结构可能会有用，所以旧的处理方式仅仅注释掉，暂时不删除。
    旧版本输出:
    old_restored_tag_list = [
        [[7, 7, symptom_pos, 右],[8, 10, symptom_obj, 上颌窦]],
        [[13, 14, exam_item, 大小]],
        [[15, 26, exam_result, 约16.8*10.3mm^]],
        [[32, 35, lesion, 低密度灶]]
    ]
    """
    restored_tag_list = []
    for i in data:
        restored_tag_list.extend(restore_tag_one(i))
    text = "".join([i[3] for i in restored_tag_list])

    return text, restored_tag_list


def is_numerical_tag(a_string):
    """
    如果一个字符串中有 任何数字，则返回True
    :param a_string: "12x22mm"
    :return: True
    ord("0") = 48
    ord("9") = 57
    """
    res = False
    start, end = ord("0"), ord("9")
    for char in a_string:
        if ord(char) in range(start, end):
            res = True
            break
    return res


def build_radlex_res(db, radlex_tree, tags, radlex_cn_name_map):
    """
    功能函数 3 - 主函数中被调用，用于构造最终返回的数据
    2019-11-25更新:
    以下是旧版本的注释(基于旧版本build_text_and_tags函数返回的复杂的 restored_tag_list 结构):
    tags = 一句结构化结果的tag列表，如:
    tags = [
                [['0', '2', 'exam', 'KUB']],
                [['4', '4', 'symptom_pos', '双'], ['5', '6', 'symptom_obj', '肾区']],
                [['18', '21', 'reversed_exam_result', '未见阳性']],
                [['22', '24', 'reversed_exam_item', '结石影']]
        ]
    tag_pair = [[4,4,pos,双], [5,6,obj,肾区]]

    以下是新版本的注释 (基于新版本 build_text_and_tags 函数返回的层级更浅，更简单的 restored_tag_list 结构)
    tags = [
        [0, 2, exam, KUB],
        [4, 4, symptom_pos, 双],
        [5, 6, symptom_obj, 肾区],
        [18, 21, reversed_exam_result, 未见阳性],
        [22, 24, reversed_exam_item, 结石影]
    ]
    可以看到，tags的层级比旧版本的要浅，所以新版本中不会有 tag_pairs 这个变量.

    该函数最终结果示例:
    res = [{'tag': ['1354', '1355', 'symptom_obj', '肛门'],
            'cn_name': '肛门',
            'radlex_id': ['RID164']
            }]
    """
    res = []
    for tag_one in tags:
        # 1 预映射 先将每一个 tag_one(如"KUB", "肾区") 规范化
        cn_name = process_raw_cn_name(db=db,
                                      curr_tag=tag_one,
                                      radlex_cn_name_map=radlex_cn_name_map)

        # 2 数值型结果如 "11x22mm", "123mg/C", "6min后" 等结果，分2种情况
        if is_numerical_tag(cn_name):
            # <1> 是time类型的tag --> 归到 "时间描述符" 下
            if tag_one[2] == "time":
                radlex_res_one = [
                    {"cn_name": "时间描述符",
                     "en_name": "temporal descriptor",
                     "parents": "RID6",
                     "rid": "RID5716"
                     }
                ]

            # <2> 不是time类型 --> 先归一到自定义的特殊 bb_radlex_id 下，之后再完善数值归一方式
            else:
                radlex_res_one = [
                    {"cn_name": "basebit_数值型描述或结果",
                     "en_name": "bb numerical description or result",
                     "parents": "RID5772",
                     "rid": "bb2019"
                     }
                ]

        # 3 再用规范后的 cn_name 去 radlex tree 中归一
        else:
            radlex_res_one = search_radlex_id(db, radlex_tree, cn_name)

        # 如果归一成功, 则放入res
        if len(radlex_res_one) > 0:
            res.append(
                {"tag": tag_one,
                 "cn_name": radlex_res_one[0]["cn_name"],
                 "radlex_id": [i["rid"] for i in radlex_res_one]}
            )

    return res


def handle_radlex(db, standard_data, norm_tree, tree_cn_name_map):
    """
    主函数

    期望输出radlex = [
        {"text": "", "tags": [], "radlex_res": [("obj肝脏": id_1), ("exam_item红细胞检查", id_2), ...]},
        {"text": "", "tags": [], "radlex_res": [("obj大脑": id_1), ("exam尿液检查", id_2), ...]}
    ]
    示例:
    <1> 原数据standard_data["res"] = [["obj肝exam_item显影_exam_result清晰", "obj肝exam_item大小exam_result正常"], [...]]

    <2> 其中一个结构化结果:
    ["obj肝exam_item显影_exam_result清晰", "obj肝entity_neg不symptom_desc光滑"]

    <3> 文本: "肝显影清晰, 大小正常。"

    <4> 归一:
    obj肝: radlex_id_1
    exam_item显影: radlex_id_2
    entity_neg不: radlex_id_3
    symptom_desc光滑: radlex_id_4

    <5> 输出:
    res = [
            {"text": "肝显影清晰, 不光滑。",
             "tags": [[0,0,obj,肝], [1,2,exam_item,显影], ...],
             "radlex_info": [
                            {"tag": [0, 0, obj, 肝],
                             "cn_name": "肝脏",
                             "radlex_id": RID22345},
                             {...},
                        ]
            },
            ...
        ]
    """

    # 构造res
    res = []
    for data in standard_data["res"]:
        # 1 text 和 tags
        text, tags = build_text_and_tags(data)

        # 2 radlex_res
        radlex_info = build_radlex_res(db, norm_tree, tags, tree_cn_name_map)

        # 3 构造结果
        tmp = {
            "text": text,
            "tags": tags,
            "radlex_info": radlex_info
        }
        # 4 放入res
        res.append(tmp)

    return res
