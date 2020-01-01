import json

from common.utils.dg_utils import FileLineIterator

def json2File(filePath, xObj):
    fp = open(filePath, 'w', encoding='utf-8')
    json.dump(xObj, fp, ensure_ascii=False)
    fp.close()
    return

def list2JsonFile(filePath, dataList):
    fp = open(filePath, 'w', encoding='utf-8')
    fp.write('[\n')
    for i in range(len(dataList)):
        dataOne = dataList[i]
        x = json.dumps(dataOne, ensure_ascii=False)
        if i > 0:
            x = ',' + x
        fp.write('\t' + x + '\n')
    fp.write(']\n')
    fp.close()
    return

def outputNode(fp, tabLevel, childrenIdx, curNode, keepTags):
    tabPrefix = ''
    if tabLevel > 0:
        tabs = ['\t'] * tabLevel
        tabPrefix = ''.join(tabs)
    children = curNode.get('children', [])

    if len(children) == 0:
        bodyStr = json.dumps(curNode, ensure_ascii=False)
        if childrenIdx > 0:
            bodyStr = ',' + bodyStr
        fp.write(tabPrefix + bodyStr + '\n')
        return

    print('-- {}.{}.{}'.format(tabLevel, len(children), curNode['en_name']))

    x  = {}
    for tagOne in keepTags:
        x[tagOne] = curNode[tagOne]
    bodyStrA = json.dumps(x, ensure_ascii=False)
    bodyStr = bodyStrA[:-1] + ', "children":['
    if childrenIdx > 0:
        bodyStr = ',' + bodyStr
    fp.write(tabPrefix + bodyStr + '\n')
    for i in range(len(children)):
        outputNode(fp, tabLevel+1, i, children[i], keepTags)
    endStr = ']}'
    fp.write(tabPrefix + endStr + '\n')
    return

def tree2JsonFile(filePath, treeObj):
    fp = open(filePath, 'w', encoding='utf-8')
    tabLevel = 0
    childrenIdx = 0
    keepTags = ['code', 'en_name']

    outputNode(fp, tabLevel, childrenIdx, treeObj, keepTags)
    fp.close()
    return

def file2Json(filePath):
    fp = open(filePath, 'r', encoding='utf-8')
    xObj = json.load(fp)
    fp.close()
    return xObj

ENTITY_HEADER_FMA = '<owl:Class rdf:about="http://purl.org/sig/ont/fma/fma'
LEN_ENTITY_HEADER_FMA = len(ENTITY_HEADER_FMA)
def checkEntityStartFMA(entityState, line, lineNum):
    idxS = line.find(ENTITY_HEADER_FMA)
    if idxS == -1:
        return True, entityState

    if 'code' in entityState:
        print('something wrong here for @not finish entity line={}\n\t{}'.format(lineNum, json.dumps(entityState, ensure_ascii=False)))
        # reset state for this entity
        # entityState = {}

    idxE = line.find('">')
    if idxE == -1:
        print('something wrong here for @not valid start entity line={}\n\t{}'.format(lineNum, line))
        entityState = {}
        return False, entityState

    code = line[idxS+LEN_ENTITY_HEADER_FMA:idxE].strip()
    entityState = {
        'code': code,
        'owl_stack': 1,
    }
    return False, entityState

ENTITY_HEADER = '<owl:Class'
def checkEntityStart(entityState, line, lineNum):
    idxS = line.find(ENTITY_HEADER)
    if idxS == -1:
        return True, entityState
    if not 'owl_stack' in entityState:
        print('something wrong here for @owl class outside FMA entity line={}\n\t{}'.format(lineNum, line))
        return True, entityState

    entityState['owl_stack'] = entityState['owl_stack'] + 1
    return False, entityState

ENTITY_TAIL = '</owl:Class>'
def checkEntityEnd(entityState, line, lineNum):
    idxS = line.find(ENTITY_TAIL)
    if idxS == -1:
        return True, entityState
    if not 'code' in entityState:
        print('something wrong here for line @not entity found when end of owl class line={}\n\t{}'.format(lineNum, line))
        return False, entityState

    if not 'owl_stack' in entityState or entityState['owl_stack'] <= 0:
        print('something wrong here for line @owl stack issue line={}\n\t{}'.format(lineNum, line))
        return False, entityState

    entityState['owl_stack'] = entityState['owl_stack'] - 1
    if entityState['owl_stack'] == 0:
        entityState['status'] = 'finish'
    return False, entityState

ENTITY_EN_NAME_HEADER = '<rdfs:label xml:lang="en">'
LEN_ENTITY_EN_NAME_HEADER = len(ENTITY_EN_NAME_HEADER)
def checkContentEnglishName(entityState, line, lineNum):
    idxS = line.find(ENTITY_EN_NAME_HEADER)
    if idxS == -1:
        return True, entityState

    idxE = line.find('</rdfs:label>')
    if idxE == -1:
        print('something wrong here for @not valid english label line={}\n\t{}'.format(lineNum, line))
        return False, entityState

    name = line[idxS+LEN_ENTITY_EN_NAME_HEADER:idxE].strip()
    entityState['en_name'] = name
    return False, entityState

ENTITY_NAME_HEADER = '<rdfs:label'
LEN_ENTITY_NAME_HEADER = len(ENTITY_NAME_HEADER)
def checkContentGeneralName(entityState, line, lineNum):
    idxS = line.find(ENTITY_NAME_HEADER)
    if idxS == -1:
        return True, entityState
    idxSE = line.find('>')
    if idxSE == -1:
        print('something wrong here for @not valid label line={}\n\t{}'.format(lineNum, line))
        return False, entityState

    idxE = line.find('</rdfs:label>')
    if idxE == -1:
        print('something wrong here for @not valid label line={}\n\t{}'.format(lineNum, line))
        return False, entityState

    name = line[idxSE+1:idxE].strip()
    entityState['general_name'] = name
    return False, entityState

ENTITY_PARENT_HEADER = '<rdfs:subClassOf rdf:resource="http://purl.org/sig/ont/fma/fma'
LEN_ENTITY_PARENT_HEADER = len(ENTITY_PARENT_HEADER)
def checkContentParent(entityState, line, lineNum):
    idxS = line.find(ENTITY_PARENT_HEADER)
    if idxS == -1:
        return True, entityState

    idxE = line.find('"/>')
    if idxE == -1:
        print('something wrong here for @not valid parent line={}\n\t{}'.format(lineNum, line))
        return False, entityState

    parentCode = line[idxS+LEN_ENTITY_PARENT_HEADER:idxE].strip()
    parents = entityState.setdefault('parents', [])
    parents.append(parentCode)
    return False, entityState

def parseFmaEntity(entityState, line, lineNum):

    # <owl:Class rdf:about="http://purl.org/sig/ont/fma/fma0058039">
    #    <rdfs:label xml:lang="en">Third lower molar socket</rdfs:label>
    #    <rdfs:subClassOf rdf:resource="http://purl.org/sig/ont/fma/fma0327377"/>
    #    <fma:FMAID rdf:datatype="http://www.w3.org/2001/XMLSchema#integer">58039</fma:FMAID>
    #    <fma:preferred_name>Third lower molar socket</fma:preferred_name>
    #</owl:Class>

    goOn, entityState = checkEntityStartFMA(entityState, line, lineNum)
    if not goOn:
        return entityState

    goOn, entityState = checkEntityStart(entityState, line, lineNum)
    if not goOn:
        return entityState

    goOn, entityState = checkEntityEnd(entityState, line, lineNum)
    if not goOn:
        return entityState

    # otherwise parse content
    goOn, entityState = checkContentEnglishName(entityState, line, lineNum)
    if not goOn:
        return entityState

    goOn, entityState = checkContentGeneralName(entityState, line, lineNum)
    if not goOn:
        return entityState

    goOn, entityState = checkContentParent(entityState, line, lineNum)
    if not goOn:
        return entityState

    return entityState

def addEntity(rst, entityState):
    del entityState['status']
    code = entityState.get('code', None)
    name = entityState.get('en_name', None)
    if name is None:
        name = entityState.get('general_name', None)
    parents = entityState.get('parents', None)
    if code is None or name is None:
        print('error entity = {}'.format(json.dumps(entityState, ensure_ascii=False)))
        return

    if parents is None:
        print('first level = {}'.format(json.dumps(entityState, ensure_ascii=False)))
    rst.append(entityState)
    return

def extractItems(srcPath, dstPath):
    rst = []
    iterator = FileLineIterator(srcPath)
    lineNum = 0
    entityState = {}
    # checked = False
    for line in iterator:
        lineNum += 1
        if lineNum % 100000 == 0:
            print('--- {}'.format(lineNum))

        # m = line.strip()
        # x0 = '<owl:Class'
        # x1 = 'fma7096'
        # idx0 = m.find(x0)
        # idx1 = m.find(x1)
        # if not checked:
        #     if idx0 == -1 or idx1 == -1:
        #         continue
        #     checked = True

        entityState = parseFmaEntity(entityState, line, lineNum)

        status = entityState.get('status', '')
        if status == 'finish':
            addEntity(rst, entityState)
            entityState = {}

        # if lineNum > 30000:
        #     break
    iterator.destroy()
    print('found entity = {}'.format(len(rst)))

    list2JsonFile(dstPath, rst)
    return

def buildCodeMap(seq):
    codeMap = {}
    for itemOne in seq:
        # {"code": "62954", "en_name": "Mucous cell of gastric gland", "parents": ["63464"]}
        code = itemOne.get('code', None)
        name = itemOne.get('en_name', None)
        if name is None:
            name = itemOne.get("general_name", None)
        if code is None:
            print('wrong miss-code = {}'.format(json.dumps(itemOne, ensure_ascii=False)))
            continue

        if name is None:
            print('wrong miss-name = {}'.format(json.dumps(itemOne, ensure_ascii=False)))
            continue
        codeMap[code] = name
    print('total = {}'.format(len(codeMap)))
    return codeMap

def buildChildMap(seq):
    xMap = {}
    firstLevel = []
    for itemOne in seq:
        # {"code": "62954", "en_name": "Mucous cell of gastric gland", "parents": ["63464"]}
        code = itemOne.get('code', None)
        if code is None:
            print('wrong miss-code = {}'.format(json.dumps(itemOne, ensure_ascii=False)))
            continue

        parents = itemOne.get('parents', None)
        if parents is None:
            firstLevel.append(code)
            # print('found root {}'.format(json.dumps(itemOne, ensure_ascii=False)))
            continue

        if len(parents) > 1:
            print('multi-parents = {}'.format(json.dumps(itemOne, ensure_ascii=False)))
            continue
        parentCode = parents[0]
        children = xMap.setdefault(parentCode, [])
        children.append(code)

    childMap = {
        'root': firstLevel,
        'childrenMap': xMap
    }
    print('first = {}'.format(len(firstLevel)))
    print('stem = {}'.format(len(xMap)))
    return childMap

def buildTreeStep1(srcPath, dstPath0, dstPath1):
    seq = file2Json(srcPath)

    codeMap = buildCodeMap(seq)
    json2File(dstPath0, codeMap)

    childMap = buildChildMap(seq)
    json2File(dstPath1, childMap)
    return

def buildTreeAll(codeMap, childMap):
    xMap = childMap['childrenMap']

    treeObj = {
        'code': 'ROOT',
        'en_name': 'ROOT',
        'children': []
    }
    xMap['ROOT'] = childMap['root']

    nodeStack = []
    curNode = treeObj
    while True:
        code = curNode['code']
        childrenCodes = xMap.get(code, [])
        if len(childrenCodes) > 0:
            children = []
            for codeOne in childrenCodes:
                x = {
                    'code': codeOne,
                    'en_name': codeMap[codeOne],
                    'children': []
                }
                children.append(x)
            curNode['children'] = children
            nodeStack.extend(children)
            print('-- stack depth = {}'.format(len(nodeStack)))

        if len(nodeStack) == 0:
            break
        curNode = nodeStack.pop(0)
        print('-- stack depth = {}'.format(len(nodeStack)))
    return treeObj

def buildTreeStep2(srcPath0, srcPath1, dstPath):
    codeMap = file2Json(srcPath0)
    childMap = file2Json(srcPath1)
    treeObj = buildTreeAll(codeMap, childMap)
    json2File(dstPath, treeObj)
    return

def tree2JsonFileAll(srcPath, dstPath):
    treeObj = file2Json(srcPath)
    tree2JsonFile(dstPath, treeObj)
    return

def main():
    task = 4

    if task == 1:
        srcPath = '/Users/shengxu/Downloads/fma/fma.owl'
        dstPath = '/Users/shengxu/Downloads/fma/seq1.json'
        extractItems(srcPath, dstPath)
    elif task == 2:
        srcPath = '/Users/shengxu/Downloads/fma/seq1.json'
        dstPath0 = '/Users/shengxu/Downloads/fma/code_map.json'
        dstPath1 = '/Users/shengxu/Downloads/fma/children_map.json'
        buildTreeStep1(srcPath, dstPath0, dstPath1)
    elif task == 3:
        dstPath = '/Users/shengxu/Downloads/fma/tree.json'
        srcPath0 = '/Users/shengxu/Downloads/fma/code_map.json'
        srcPath1 = '/Users/shengxu/Downloads/fma/children_map.json'
        buildTreeStep2(srcPath0, srcPath1, dstPath)
    elif task == 4:
        dstPath = '/Users/shengxu/Downloads/fma/tree_friend.json'
        srcPath = '/Users/shengxu/Downloads/fma/tree.json'
        tree2JsonFileAll(srcPath, dstPath)

    return

if __name__ == "__main__":
    main()
