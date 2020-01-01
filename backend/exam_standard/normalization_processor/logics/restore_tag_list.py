from exam_standard.normalization_processor.utils import restore_tag_one


def restore_tag_list(standard_res):
    restored_tag_list = []

    for res_one in standard_res:
        for res in res_one:
            restored_tag_one = restore_tag_one(res)
            for tag_one in restored_tag_one:
                if tag_one not in restored_tag_list:
                    restored_tag_list.append(tag_one)

    return restored_tag_list
