from exam_standard.exam_standard_processor.utils import get_sort_key


def build_sorted_product_params(*unsorted_stacks):
    """
    功能函数 -- 用来将传入的所有stack, 按照索引，进行先后顺序的排序
    排序依据: 检查报告中每个词出现的先后顺序
    """

    sorted_stacks = []
    for stackOne in unsorted_stacks:
        if len(stackOne) > 0:
            sorted_stacks.append(stackOne)

    sorted_stacks.sort(key=get_sort_key)

    return sorted_stacks
