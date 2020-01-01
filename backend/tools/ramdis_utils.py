import math
import json

def yesOrNo(val):
    x = 0
    if val is None or val == '':
        return val
    if val.strip().lower() == 'y':
        x = 1
    return x

def diagnosis(m):
    # 3-@METHYLGLUTACONIC ACIDURIA, TYPE I (MIM 250950)
    x = m.strip()
    lenX = len(x)
    startIdx = None
    endIdx = None
    for i in range(lenX-1, -1, -1):
        if x[i] == ')':
            endIdx = i
        elif x[i] == '(':
            startIdx = i
            break
    if startIdx is None or endIdx is None or endIdx <= startIdx+1:
        return '', ''
    omim = x[startIdx+1:endIdx]
    disease = x[:startIdx].strip()
    return disease, omim

def ethnicOrigin(m):
    rst = {}
    if m is None or m == '':
        return rst

    # Mother: Caucasian, Father: Caucasian
    fields = m.strip().split(',')
    for fieldOne in fields:
        idxS = fieldOne.find('Mother:')
        if idxS != -1:
            x = fieldOne[idxS+len('Mother:')+1:]
            rst['mother'] = x.strip()
            continue

        idxS = fieldOne.find('Father:')
        if idxS != -1:
            x = fieldOne[idxS + len('Father:') + 1:]
            rst['father'] = x.strip()
            continue

    return rst

AgeUnitTags = ['Day(s)','Year(s)','Month(s)','Week(s)']
def checkAgeParts(x):
    xFloat = None
    xUnit = None
    for tag in AgeUnitTags:
        idxS = x.find(tag)
        if idxS == -1:
            continue
        y = x[:idxS].strip()
        xFloat = float(y)
        xUnit = x[idxS:].strip().replace('(s)', '')
    return xFloat, xUnit

DAYS_PER_YEAR = 365
MONTHS_PER_YEAR = 12
WEEKS_PER_YEAR = 365.0/7.0
def makeGeneral(xFloat, xUnit):
    # default as 'Year':
    yearFloat = xFloat
    if xUnit == 'Month':
        yearFloat = xFloat / MONTHS_PER_YEAR
    elif xUnit == 'Week':
        yearFloat = xFloat / WEEKS_PER_YEAR
    elif xUnit == 'Day':
        yearFloat = xFloat / DAYS_PER_YEAR

    # split age into year,month,day,hour for friendly display for children
    yearInt = math.floor(yearFloat)
    if xFloat == int(xFloat) and xUnit in ['Month', 'Day']:
        if xUnit == 'Month':
            monthIntAll = int(xFloat)
            monthInt = monthIntAll % 12
            dayInt = 0
            hourInt = 0
        else:   # means day
            dayIntAll = int(xFloat)
            monthInt = dayIntAll // 30
            dayInt = dayIntAll % 30
            hourInt = 0
    else:
        monthFloat = (yearFloat - yearInt) * 12
        monthInt = math.floor(monthFloat)
        dayFloat = (monthFloat - monthInt) * 30
        dayInt = math.floor(dayFloat)
        hourFloat = (dayFloat - dayInt) * 24
        hourInt = math.floor(hourFloat)

    rst = {
        'ageInYear': round(yearFloat, 4),
        'year': yearInt,
        'month': monthInt,
        'day': dayInt,
        'hour': hourInt
    }
    return rst

def makeFullAge(m):
    rst = {}
    if m is None or m == '':
        return rst

    # 0 Day(s), 3 Year(s), 27 Month(s), 9 Week(s)
    x = m.strip()
    xFloat, xUnit = checkAgeParts(x)
    rst = makeGeneral(xFloat, xUnit)
    return rst

copyTags = ['country', 'hospital', 'patient_id', 'gender', 'history']
def buildCnContext(one):
    x = {}
    for tagOne in copyTags:
        x[tagOne] = one[tagOne]

    x['found_in_newborn'] = yesOrNo(one['found_in_newborn'])
    x['diagnosis_confirmed'] = yesOrNo(one['diagnosis_confirmed'])

    disease, omim = diagnosis(one['diagnosis'])
    x['diagosis'] = disease
    x['omim'] = omim

    x['ethnic_origin'] = ethnicOrigin(one['ethnic_origin'])

    x['age_of_diagnosis'] = makeFullAge(one['age_of_diagnosis'])
    x['age_of_symptoms_onset'] = makeFullAge(one['age_of_symptoms_onset'])

    x['history_cn'] = one['cn_context']

    text = json.dumps(x, ensure_ascii=False)
    return text

def main():
    task = 4

    if task == 1:
        print(yesOrNo('y'), yesOrNo('n'), yesOrNo('Y'), yesOrNo('N'))
    elif task == 2:
        print(diagnosis('3-@METHYLGLUTACONIC ACIDURIA, TYPE I (MIM 250950)'))
    elif task == 3:
        print(ethnicOrigin('Mother: German, Father: Turkish'))
    elif task == 4:
        print(makeFullAge('3.43 Week(s)'))
        print(makeFullAge('18 Month(s)'))
        print(makeFullAge('11.42 Year(s)'))
        print(makeFullAge('6 Day(s)'))

    return

if __name__ == "__main__":
    main()