from itertools import product
from exam_standard.exam_standard_processor.utils import connect
from exam_standard.exam_standard_processor.logic.bu_get_product_params_func_args import get_product_params_func_args
from exam_standard.exam_standard_processor.logic.bu_build_sorted_product_params import build_sorted_product_params


def check_build_timing(seg, text, i, stack):
    """
    功能函数 1 -- 检查是否是合适的拼接时机(根据原文本的标点来判断)

    基本流程:
    text = "肾大小正常, 表面光滑...."
    seg = [[0,1,obj,肾], [2,4,exam_item,大小], [5,7,exam_result,正常], ...]
    i 是 seg 的索引, seg[i] = [5,7,exam_result,正常]
    seg[i][1] = 7
    如果当前result "正常" 和 下一个tag "表面"之间有逗号(原文text中), 那么返回True，可以拼

    特殊情况:
    <1> 当送进一个 symptom_deco 时，需要检查 stack["special_can_build_deco"], 如果该stack的值是自己，则可以拼接
    这个stack的值，会在handle_symptom_deco 函数中判断是否赋值

    <2> 当送进一个 disease 时, 需要作如下判断:
        a. 判断 stack["disease_desc"] 是否为空
            a-1 不为空 --> 则正常根据标点符号，来作为can_build 的判断依据;(即: 遇到逗号才拼结果)
            a-2 为空 --> 跳转到 b
        b. 判断当前 "disease" 和下一个标点之间, 是否有 disease_desc
            b-1 有 --> 正常判断，用标点作为依据 (当前disease后面有标点才拼结果，否则返回False)
            b-2 无 --> 也就是说，这个disease 在当前seg中，是一个孤零零的 disease,没有任何 disease_desc 与之匹配 --> 直接返回True
    """

    # 以下新版本使用较显式的逻辑, 初始False --> 遇到合适时机则 True
    can_build = False
    tag_type = seg[i][2]
    comma_list = [",", "，", ".", "。", ";", "；"]

    while True:
        if i == len(seg) - 1:
            can_build = True
            break

        # symptom_deco 需要看特殊栈
        if tag_type == "symptom_deco":
            if stack["special_can_build_deco"] == seg[i]:
                can_build = True
                break

        # symptom_desc 和 treatment_desc 为 True
        if tag_type in ["symptom_desc", "treatment_desc"]:
            can_build = True
            break

        if tag_type in ["exam_result", "lesion", "lesion_desc", "reversed_exam_item",
                        "medicine", "symptom", "disease_desc"]:
            # 这个 if 避免 seg[i+1]出现 IndexError
            if i == len(seg) - 1:
                can_build = True
                break

            start = seg[i][1]
            end = seg[i + 1][0] + 1
            for comma in comma_list:
                if comma in text[start:end]:
                    can_build = True
                    break

            if can_build:
                break

            # 如果为False --> 对disease特殊处理 (检查后面有没有disease_desc)
            has_disease_desc_after_current_disease = False
            for tag in seg[i:]:
                if tag[2] == "disease_desc":
                    has_disease_desc_after_current_disease = True
                    break

            # 如果没有, 则返回 True, 强行让disease 返回一个结果 (也就是特殊处理)
            if has_disease_desc_after_current_disease is None:
                can_build = True
        break

    return can_build


def get_branches(stack):
    """
    功能函数 2 - 获取forest中每一个branch
    stack["forest"] = [root1, root2]
    root即一个tree, 每个tree(一个Entity对象)都有children
    """

    def get_path_in_tree(node, tmp):
        if not node.children:
            ans = []
            for n in tmp:
                if n.prepos:
                    ans.append(n.prepos)
                ans.append(n.complete)
                if n.afterpos:
                    ans.append(n.afterpos)
            return [ans]
        else:
            ans = []
            for c in node.children:
                ans += get_path_in_tree(c, tmp + [c])
            return ans

    forest = stack["forest"]
    branches = []
    for root in forest:
        tmp = [root]
        branches += get_path_in_tree(root, tmp)

    return branches


def build_work_flow(seg, text, res_seg, i, stack):
    """
    主函数

    遇到 exam_result, reversed_exam_item, lesion, lesion_desc, treatment_desc, symptom_desc 时调用
    :param seg: 子seg
    :param text: 原文本, "肝大小正常, 形态规则,...."
    :param res_seg: 存储该seg的结果
    :param i: 当前标签在seg中的索引
    :param stack: stack = {"ppos": [..], "ppo_stack": [..], "lesion": [..], "exam_item": [..], ...}
    :return: res_seg: itertools.product 拼接的结果
    """

    stack[seg[i][2]].append(connect(seg[i]))

    # 1 调用功能函数，确认合适的拼接时机
    can_build = check_build_timing(seg, text, i, stack)

    if can_build:
        # 2 拼接 pos / obj / part 主体部分
        branches = get_branches(stack)
        stack["branches"] = ["".join(b) for b in branches]

        # 3 获取这次拼接需要的stack(不同的标签需要的stack不同，比如exam_result不需要symptom_deco的stack)
        args = get_product_params_func_args(seg[i][2], stack)

        # 4 按照原报告中文字出现的先后顺序，进行排序
        product_params = build_sorted_product_params(*args)

        # 5 拼接
        prod_res = list(product(*product_params))
        for prod_res_One in prod_res:
            prod_res_One = list(prod_res_One)
            prod_res_One.sort(key=lambda x: int(x[x.index("#")+1:x.index("$")]))
            res_seg.append(prod_res_One)

        # lesion 和 disease 由于前后都要拼, 所以不清空. 其他需要清空.
        if seg[i][2] not in ["lesion", "disease"]:
            stack[seg[i][2]] = []

        # 将 特殊的标志位归零
        # 以下2个在 handle_symptom_deco 中使用
        stack["speical_can_build_deco"] = None
        # 以下1个在 handle_symptom_desc 中使用
        stack["special_obj_between_obj_and_comma"] = []

    return res_seg, stack
