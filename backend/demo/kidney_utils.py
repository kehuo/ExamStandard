import json
import re
import demo.pack_utils as packUtils

CN_TYPE_PATTERN = ''

def getPattern(text, pattern):
    return

RomeNumber = [
    ['IX', 9], ['X', 10], ['VIII', 8], ['VII', 7], ['VI', 6],
    ['IV', 4], ['V', 5], ['III', 3], ['II', 2], ['I', 1],
    # single char array
    ['Ⅲ', 3],['Ⅷ', 8],['Ⅳ', 4],['Ⅸ', 9],['Ⅵ',6],['Ⅱ',2],['Ⅴ',5],['Ⅶ', 7],['Ⅰ',1]
]
def checkHaasType(text):
    # HaasⅣ级
    m = packUtils.makeEnglishAsAscii(text, 'upper')
    if m.find('HAAS') == -1 and m.find('HASS') == -1:
        # don't know which is true indeed ???
        return False, None, None
    level = 'UNKNOWN'
    for k, v in RomeNumber:
        if m.find(k) != -1:
            level = k
            break
    return True, 'Haas', level

OxfordKeys = ['牛津分型', '牛津']
def checkOxfordType(text):
    # M1E0S1T1-C1, 牛津分型M1E1S1T1
    raw = packUtils.makeEnglishAsAscii(text, 'upper')
    for k in OxfordKeys:
        if raw.find(k) == -1:
            continue
        raw = raw.replace(k, '')
        break
    if not re.match('M\dE\dS\dT\d*', raw):
        return False, None, None
    return True, 'Oxford', raw.strip()

def getNumberType(text):
    raw = packUtils.makeEnglishAsAscii(text, 'upper')
    found = False
    for k, v in RomeNumber:
        if raw.find(k) != -1:
            found = True
            break
    if not found:
        return False, None, None
    raw = text.replace('（', '(')
    raw = raw.replace('）', ')')
    return True, 'phase', raw.strip()

def checkDescType(text):
    if text.find('型') == -1:
        return False, None, None
    return True, 'desc', text.strip()

FuncArray = [checkHaasType, checkOxfordType, getNumberType, checkDescType]
def getKidneyDiseaseType(partOne):
    text = getPartContent(partOne)
    # HaasⅣ级, M1E0S1T1-C1, 牛津分型M1E1S1T1, M1E0S1T2-C0
    # Ⅰ-Ⅱ期, Ⅲb, Ⅳ-G（C）+Ⅴ
    key = None
    data = None
    for funcOne in FuncArray:
        hasFound, key, data = funcOne(text)
        if hasFound:
            break
    return key, data

def getPartContent(partOne):
    # 2019-11-25 特殊符号将* 换成@
    # #0$4&disease*IgA肾病
    # fields = partOne.split('*')
    fields = partOne.split('@')
    if len(fields) < 2:
        return ''
    text = ''.join(fields[1:])
    return text

def normKidneyDisease(segOne):
    y = packUtils.normPack(segOne)
    if y is None:
        return None
    # some ugly code to detect I,II... and HASS 牛津
    # <class 'list'>: [['#0$4&disease@IgA肾病^', '#6$11&disease_desc@HaasⅣ级^'], ['#13$23&disease_desc@M1E0S1T1-C1^']]
    name = ''
    addition = {}
    for m in segOne:
        parts = m.split('^')
        for partOne in parts:
            if partOne == '':
                continue
            if packUtils.isTagPart(partOne, 'disease'):
                name = getPartContent(partOne)
            elif packUtils.isTagPart(partOne, 'disease_desc'):
                key, data = getKidneyDiseaseType(partOne)
                if not key is None:
                    ms = addition.setdefault(key, [])
                    ms.append(data)
    y['full_text'] = y['text']
    y['text'] = name
    y['addition'] = addition
    return y
