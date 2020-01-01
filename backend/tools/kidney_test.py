import copy
import json

from exam_standard.exam_standard_processor.exam_standard import ExamStandardProcessor
from demo.bu_demo import buildDemoResult

TEST_CASE = [
    {
        'diagnosis': 'IgA肾病（HaasⅣ级，M1E0S1T1-C1）。',
        'diagnosis_tag': {"entity":[[0,4,"disease"],[6,11,"disease_desc"],[13,23,"disease_desc"],[25,25,"vector_seg"]]},
        'content': '送检肾穿刺组织见7个肾小球，其中3个缺血性硬化，1个节段性硬化，其余肾小球系膜细胞及基质局灶节段轻-中度增生伴球囊粘连，内皮细胞节段轻度增生，基底膜未见明显增厚，肾小管间质病变轻度，小管上皮细胞空泡及颗粒状变性伴小灶状萎缩，间质小灶状单个核细胞浸润，小动脉管壁僵硬，轻度增厚。',
        'content_tag': {"entity":[[0,1,"exam"],[2,6,"symptom_obj"],[7,7,"vector_seg"],[8,9,"symptom_desc"],[10,12,"symptom_obj"],[16,17,"symptom_deco"],[18,22,"symptom_desc"],[24,25,"symptom_deco"],[26,30,"symptom_desc"],[31,31,"vector_seg"],[32,33,"symptom_deco"],[34,36,"symptom_obj"],[37,40,"object_part"],[42,43,"object_part"],[44,47,"object_part"],[48,51,"symptom_deco"],[52,53,"symptom_desc"],[55,58,"symptom_desc"],[60,65,"object_part"],[66,67,"symptom_deco"],[68,69,"symptom_desc"],[71,73,"object_part"],[74,75,"entity_neg"],[76,77,"symptom_deco"],[78,79,"symptom_desc"],[80,80,"vector_seg"],[81,83,"symptom_obj"],[84,85,"object_part"],[86,87,"symptom_desc"],[88,89,"symptom_deco"],[91,96,"object_part"],[97,98,"symptom_desc"],[100,104,"symptom_desc"],[106,110,"symptom_desc"],[112,113,"object_part"],[114,116,"symptom_deco"],[117,123,"symptom_desc"],[125,129,"object_part"],[130,131,"symptom_desc"],[133,134,"symptom_deco"],[135,136,"symptom_desc"],[137,137,"vector_seg"]]},
    },
    {
        'diagnosis': 'IgA肾病（HassⅢ级，局灶增生型，牛津分型M1E1S1T1），伴较多肾小球硬化（3/7）。',
        'diagnosis_tag':{"entity":[[0,4,"disease"],[6,11,"disease_desc"],[13,17,"disease_desc"],[19,30,"disease_desc"],[32,32,"vector_seg"],[34,35,"symptom_deco"],[36,38,"symptom_obj"],[39,40,"symptom_desc"],[42,44,"symptom_deco"],[46,46,"vector_seg"]]},
        'content': '送检肾穿刺组织见20个肾小球，其中1个球性硬化，其余肾小球系膜细胞及基质局灶节段轻度增生，节段内皮细胞空泡变性，基底膜无明显增厚，节段空泡变性，肾小管间质病变轻度，小管上皮细胞空泡及颗粒状变性伴小灶状萎缩，间质小灶状单个核细胞浸润，部分小动脉增厚较明显。',
        'content_tag': {"entity":[[0,1,"exam"],[2,6,"symptom_desc"],[7,7,"vector_seg"],[8,10,"symptom_desc"],[11,13,"symptom_obj"],[17,18,"symptom_deco"],[19,22,"symptom_desc"],[23,23,"vector_seg"],[24,25,"symptom_deco"],[26,28,"symptom_obj"],[29,32,"object_part"],[34,35,"object_part"],[36,39,"object_part"],[40,41,"symptom_deco"],[42,43,"symptom_desc"],[45,50,"object_part"],[51,54,"symptom_desc"],[56,58,"object_part"],[59,59,"entity_neg"],[60,61,"symptom_deco"],[62,63,"symptom_desc"],[65,66,"object_part"],[67,70,"symptom_desc"],[71,71,"vector_seg"],[72,74,"symptom_obj"],[75,76,"object_part"],[77,78,"symptom_desc"],[79,80,"symptom_deco"],[82,87,"object_part"],[88,89,"symptom_desc"],[91,95,"symptom_desc"],[97,101,"symptom_desc"],[103,104,"object_part"],[105,107,"symptom_deco"],[108,114,"symptom_desc"],[116,117,"symptom_deco"],[118,120,"object_part"],[121,122,"symptom_desc"],[123,125,"symptom_deco"],[126,126,"vector_seg"]]},
    },
    {
        'diagnosis': '考虑为肾小球轻微病变，不除外局灶节段肾小球硬化症，请结合临床及电镜。',
        'diagnosis_tag': {"entity":[[0,1,"disease_desc"],[3,9,"disease"],[10,10,"vector_seg"],[11,13,"disease_desc"],[14,17,"disease_desc"],[18,23,"disease"],[24,24,"vector_seg"],[33,33,"vector_seg"]]},
        'content': '送检肾穿刺组织见8个肾小球，其中3个球性硬化，1个缺血性硬化，2个大细胞性新月体。一个肾小球系膜细胞及基质重度增生伴内皮细胞明显增生，其余小球系膜细胞及基质轻-中度增生；肾小管间质病变中-重度，肾小管上皮空泡及颗粒状变性伴多灶状萎缩，管腔内见较多粗大蛋白管型，间质多灶状淋巴、单核细胞浸润伴纤维化，部分小动脉增厚较明显。',
        'content_tag': {"entity":[[0,1,"exam"],[2,6,"symptom_obj"],[7,7,"vector_seg"],[8,9,"symptom_desc"],[10,12,"symptom_obj"],[16,17,"symptom_deco"],[18,21,"symptom_desc"],[23,24,"symptom_deco"],[25,29,"symptom_desc"],[31,32,"symptom_deco"],[33,39,"symptom_desc"],[40,40,"vector_seg"],[41,42,"symptom_deco"],[43,45,"symptom_obj"],[46,49,"object_part"],[51,52,"object_part"],[53,54,"symptom_deco"],[55,56,"symptom_desc"],[58,61,"object_part"],[62,63,"symptom_deco"],[64,65,"symptom_desc"],[66,66,"vector_seg"],[67,68,"symptom_deco"],[69,70,"symptom_obj"],[71,74,"object_part"],[76,77,"object_part"],[78,81,"symptom_deco"],[82,83,"symptom_desc"],[84,84,"vector_seg"],[85,87,"symptom_obj"],[88,89,"object_part"],[90,91,"symptom_desc"],[92,95,"symptom_deco"],[96,96,"vector_seg"],[97,99,"symptom_obj"],[100,101,"object_part"],[102,103,"symptom_desc"],[105,109,"symptom_desc"],[111,115,"symptom_desc"],[117,119,"object_part"],[121,122,"symptom_deco"],[123,124,"symptom_deco"],[125,128,"symptom_desc"],[130,131,"object_part"],[132,134,"symptom_deco"],[135,143,"symptom_desc"],[145,147,"symptom_desc"],[149,150,"symptom_deco"],[151,153,"object_part"],[154,155,"symptom_desc"],[156,158,"symptom_deco"],[159,159,"vector_seg"]]},
    },
    {
        'diagnosis': '病理诊断：膜性肾病（Ⅰ-Ⅱ期）。',
        'diagnosis_tag': {"entity":[[4,4,"vector_seg"],[5,8,"disease"],[10,13,"disease_desc"],[15,15,"vector_seg"]]},
        'content': '送检肾穿刺组织见9个肾小球，其中1个小细胞性新月体，3个球性硬化，1个缺血性硬化。肾小球系膜细胞及基质轻度增生；基底无明显增厚；肾小管间质病变轻度，小管上皮空泡及颗粒状变性，间质见数个单个核细胞浸润；小动脉未见明显增厚。',
        'content_tag': {"entity":[[0,1,"exam"],[2,6,"symptom_obj"],[7,7,"vector_seg"],[8,9,"symptom_desc"],[10,12,"symptom_obj"],[16,17,"symptom_deco"],[18,24,"symptom_desc"],[26,27,"symptom_deco"],[28,31,"symptom_desc"],[33,34,"symptom_deco"],[35,39,"symptom_desc"],[40,40,"vector_seg"],[41,43,"symptom_obj"],[44,47,"object_part"],[49,50,"object_part"],[51,52,"symptom_deco"],[53,54,"symptom_desc"],[56,57,"object_part"],[58,58,"entity_neg"],[59,60,"symptom_deco"],[61,62,"symptom_desc"],[63,63,"vector_seg"],[64,66,"symptom_obj"],[67,68,"object_part"],[69,70,"symptom_desc"],[71,72,"symptom_deco"],[74,77,"object_part"],[78,79,"symptom_desc"],[81,85,"symptom_desc"],[87,88,"object_part"],[90,91,"symptom_deco"],[92,98,"symptom_desc"],[100,102,"object_part"],[103,104,"entity_neg"],[105,106,"symptom_deco"],[107,108,"symptom_desc"],[109,109,"vector_seg"]]},
    },
    {
        'diagnosis': '结合临床，考虑紫瘢性肾炎（Ⅲb）。',
        'diagnosis_tag': {"entity":[[5,6,"disease_desc"],[7,11,"disease"],[13,14,"disease_desc"],[16,16,"vector_seg"]]},
        'content': '送检肾穿刺组织见25个肾小球，其中5个缺血性硬化，3个节段性硬化；肾小球系膜细胞及基质局灶节段轻-中度增生，内皮细胞无明显增生，基底膜无明显增厚，系膜区见嗜复红蛋白沉积，见1处袢坏死，多处球囊粘连，部分小球内见红细胞聚集；肾小管间质病变中度，小管上皮细胞空泡及颗粒变性伴多灶状萎缩，见数个红细胞管型，间质多灶状单个核细胞浸润伴纤维化；小动脉增厚，1处入球小动脉伴玻璃样变性。',
        'content_tag': {"entity":[[0,1,"exam"],[2,6,"symptom_obj"],[7,7,"vector_seg"],[8,10,"symptom_desc"],[11,13,"symptom_obj"],[17,18,"symptom_deco"],[19,23,"symptom_desc"],[25,26,"symptom_deco"],[27,31,"symptom_desc"],[32,32,"vector_seg"],[33,35,"symptom_obj"],[36,39,"object_part"],[41,42,"object_part"],[43,46,"object_part"],[47,50,"symptom_deco"],[51,52,"symptom_desc"],[54,57,"object_part"],[58,58,"entity_neg"],[59,60,"symptom_deco"],[61,62,"symptom_desc"],[64,66,"object_part"],[67,67,"entity_neg"],[68,69,"symptom_deco"],[70,71,"symptom_desc"],[73,75,"object_part"],[77,83,"symptom_desc"],[86,87,"symptom_deco"],[88,90,"symptom_desc"],[92,93,"symptom_deco"],[94,97,"symptom_desc"],[98,98,"vector_seg"],[99,100,"symptom_deco"],[101,102,"symptom_obj"],[103,103,"symptom_pos"],[105,109,"symptom_desc"],[110,110,"vector_seg"],[111,113,"symptom_obj"],[114,115,"object_part"],[116,117,"symptom_desc"],[118,119,"symptom_deco"],[121,126,"object_part"],[127,128,"symptom_desc"],[130,133,"symptom_desc"],[135,139,"symptom_desc"],[142,143,"symptom_deco"],[144,148,"symptom_desc"],[150,151,"object_part"],[152,154,"symptom_deco"],[155,161,"symptom_desc"],[163,165,"symptom_desc"],[167,169,"object_part"],[170,171,"symptom_desc"],[173,174,"symptom_deco"],[175,179,"object_part"],[180,180,"symptom_deco"],[181,185,"symptom_desc"],[186,186,"vector_seg"]]},
    },
    {
        'diagnosis': '结合临床，考虑狼疮性肾炎（Ⅳ-G（C）+Ⅴ）合并糖尿病肾病，请结合电镜（硬化球占83%）。',
        'diagnosis_tag': {"entity":[[5,6,"disease_desc"],[7,11,"disease"],[13,20,"disease_desc"],[22,23,"disease_desc"],[24,28,"disease"],[29,29,"vector_seg"],[33,34,"exam"],[36,38,"exam_item"],[39,42,"exam_result"],[44,44,"vector_seg"]]},
        'content': '送检肾穿刺组织见23个肾小球，其中2个球性硬化。肾小球系膜细胞及基质局灶节段轻度增生，内皮细胞无明显增生，基底膜弥漫轻度增厚，上皮下可见嗜复红蛋白沉积，无明显钉突形成。肾小管间质病变轻度，小管上皮空泡及颗粒状变性伴小灶状萎缩，间质小灶状单个核细胞浸润及纤维化，小动脉未见明显增厚。',
        'content_tag': {"entity":[[0,1,"exam"],[2,6,"symptom_obj"],[7,7,"vector_seg"],[8,10,"symptom_desc"],[11,13,"symptom_obj"],[17,18,"symptom_deco"],[19,22,"symptom_desc"],[23,23,"vector_seg"],[24,26,"symptom_obj"],[27,30,"object_part"],[32,33,"object_part"],[34,37,"object_part"],[38,39,"symptom_deco"],[40,41,"symptom_desc"],[43,46,"object_part"],[47,47,"entity_neg"],[48,49,"symptom_deco"],[50,51,"symptom_desc"],[53,55,"object_part"],[56,57,"symptom_deco"],[58,59,"symptom_deco"],[60,61,"symptom_desc"],[63,64,"object_part"],[65,65,"symptom_pos"],[68,74,"symptom_desc"],[76,76,"entity_neg"],[77,78,"symptom_deco"],[79,82,"symptom_desc"],[83,83,"vector_seg"],[84,86,"symptom_obj"],[87,88,"object_part"],[89,90,"symptom_desc"],[91,92,"symptom_deco"],[94,97,"object_part"],[98,99,"symptom_desc"],[101,105,"symptom_desc"],[107,111,"symptom_desc"],[113,114,"object_part"],[115,117,"symptom_deco"],[118,124,"symptom_desc"],[126,128,"symptom_desc"],[130,132,"object_part"],[133,134,"entity_neg"],[135,136,"symptom_deco"],[137,138,"symptom_desc"],[139,139,"vector_seg"]]},
    },
]

def printDiagnosis(caseT):
    print(caseT['diagnosis'])
    for m in caseT['diagnosis_lossless']:
        print(m['type'], m['text'], m.get('addition', {}))
    return

def printContent(caseT):
    print(caseT['content'])
    for m in caseT['content_lossless']:
        print(m['type'], m['text'])
    return

def main():
    task = 2
    esp = ExamStandardProcessor()
    if task == 1:
        allCases = TEST_CASE
    elif task == 2:
        allCases = [TEST_CASE[1]]

    for caseOne in allCases:
        caseT = copy.deepcopy(caseOne)
        caseT['diagnosis_tag'] = json.dumps(caseT['diagnosis_tag'], ensure_ascii=False)
        caseT['content_tag'] = json.dumps(caseT['content_tag'], ensure_ascii=False)
        buildDemoResult(caseT, esp)
        # print(json.dumps(caseT, ensure_ascii=False))
        print('\n')
        printDiagnosis(caseT)
        printContent(caseT)

    return

if __name__ == "__main__":
    main()
