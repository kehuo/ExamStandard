import json
import re
from exam_standard.normalization_processor.utils import restore_tag_one

def adapt3to4Seg(seg3s, content):
    for seg3One in seg3s:
        text = content[seg3One[0]:seg3One[1]+1]
        seg3One.append(text)
    return

def isTagSeg(segOne, tag):
    mark = '&' + tag + '*'
    rst = False
    for m in segOne:
        if m.find(mark) == -1:
            continue
        rst = True
    return rst

def isTagPart(partOne, tag):
    mark = '&' + tag + '@'
    if partOne.find(mark) == -1:
        return False
    return True

def checkInArray(tgts, refs):
    rst = False
    for tgtOne in tgts:
        if tgtOne in refs:
            rst = True
            break
    return rst

def getSegPartType(m):
    # '#0$1&symptom_obj*胸廓^#2$3&symptom_pos*两侧^'
    ys = re.findall(r'&\S+\@', m)
    if checkInArray(['&disease@'], ys):
        return 'disease'
    if checkInArray(['&exam_result@', '&reversed_exam_result@'], ys):
        return 'exam'
    if checkInArray(['&lesion_desc@', '&symptom_desc@', '&symptom@'], ys):
        return 'symptom'
    return None

def normPack(segOne):
    segType = None
    tags = []
    textContents = []
    for m in segOne:
        curType = getSegPartType(m)
        if not curType is None:
            segType = curType
        # ([4, 4, "symptom_pos", "双"], [5, 6, "symptom_obj", "肾区"])
        tagsLocal = restore_tag_one(m)
        tags.extend(tagsLocal)
        contentLocal = [i[3] for i in tagsLocal]
        textContents.extend(contentLocal)

    if segType is None:
        return None

    y = {
        'text': ''.join(textContents),
        'misc': {
            'tags': tags
        },
        'type': segType
    }
    return y


def strQ2B(ustring):
    """把字符串全角转半角"""
    ss = []
    for s in ustring:
        rstring = ""
        for uchar in s:
            inside_code = ord(uchar)
            if inside_code == 12288:  # 全角空格直接转换
                inside_code = 32
            elif (inside_code >= 65281 and inside_code <= 65374):  # 全角字符（除空格）根据关系转化
                inside_code -= 65248
            rstring += chr(inside_code)
        ss.append(rstring)
    return ''.join(ss)


def strB2Q(ustring):
    """把字符串半角转全角"""
    ss = []
    for s in ustring:
        rstring = ""
        for uchar in s:
            inside_code = ord(uchar)
            if inside_code == 32:  # 全角空格直接转换
                inside_code = 12288
            elif (inside_code >= 33 and inside_code <= 126):  # 全角字符（除空格）根据关系转化
                inside_code += 65248
            rstring += chr(inside_code)
        ss.append(rstring)
    return ''.join(ss)

def makeEnglishAsAscii(ustring, formatType=None):
    asciiStr = strQ2B(ustring)
    if formatType == 'lower':
        asciiStr = asciiStr.lower()
    elif formatType == 'upper':
        asciiStr = asciiStr.upper()
    return asciiStr
