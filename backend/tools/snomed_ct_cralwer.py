import importlib
from flask import Flask
import traceback
import urllib.parse
import http.client
import random
import time
import json

from app.init_global import init_db, global_var
from common.utils.db import build_rows_result

table_models  = importlib.import_module('db_models.db_models')
bg_app = Flask(__name__)
bg_app.config.from_pyfile('../service.conf', silent=True)

global global_var
global_var = {}
init_db(bg_app, global_var)
db = global_var['db']

from db_models.db_models import SnomedCtEntity, SnomedCtEntityRelationship, SnomedCtEntitySynonym


def createClient():
    client = None
    try:
        client = http.client.HTTPSConnection('browser.ihtsdotools.org')
    except Exception as e:
        error = traceback.format_exc()
        print(error)
    return client

SNOMED_CT_PREFIX = '/snowstorm/snomed-ct/browser'
VERSION = '/MAIN/SNOMEDCT-US/2019-09-01'
SNOMED_CT_FULL = SNOMED_CT_PREFIX + VERSION

def getCurConcept(client, curCode):
    try:
        myurl = SNOMED_CT_FULL + '/concepts/{}?descendantCountForm=inferred'.format(curCode)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
            'Cookie': 'licenseCookie=true; _ga=GA1.2.1549235264.1575442901; _gid=GA1.2.1159893696.1575442901; _iub_cs-7822445=%7B%22consent%22%3Atrue%2C%22timestamp%22%3A%222019-12-04T12%3A53%3A48.847Z%22%2C%22version%22%3A%220.13.24%22%2C%22id%22%3A7822445%7D; _gat=1',
            'Connection': 'keep-alive',
            'Content-Type': 'text/plain;charset=UTF-8',
        }
        client.request('GET', myurl, headers=headers)
        response = client.getresponse()
        result = response.read()
        m = result.decode('utf-8')
        mObj = json.loads(m)

        fsn = mObj.get('fsn', {})
        en_name = ''
        if fsn.get('lang', None) == 'en':
            en_name = fsn.get('term', '')

        # {
        #   "conceptId":"122559001",
        #   "descendantCount":1,
        #   "fsn":{"term":"Blood specimen from control (specimen)","lang":"en"},
        #   "pt":{"term":"Blood specimen from control","lang":"en"},
        #   "active":true,
        #   "effectiveTime":"20020131",
        #   "released":true,
        #   "releasedEffectiveTime":20020131,
        #   "moduleId":"900000000000207008",
        #   "definitionStatus":"PRIMITIVE",
        #   "descriptions":[{
        #       "active":true,
        #       "released":true,
        #       "releasedEffectiveTime":20170731,
        #       "descriptionId":"723854016",
        #       "term":"Blood specimen from control (specimen)","conceptId":"122559001",
        #       "moduleId":"900000000000207008","typeId":"900000000000003001",
        #       "acceptabilityMap":{"900000000000509007":"PREFERRED","900000000000508004":"PREFERRED"},
        #       "type":"FSN","lang":"en","caseSignificance":"CASE_INSENSITIVE","effectiveTime":"20170731"
        #   }, {
        #       "active":true,"released":true,"releasedEffectiveTime":20170731,"descriptionId":"180805013",
        #       "term":"Blood specimen from control","conceptId":"122559001","moduleId":"900000000000207008",
        #       "typeId":"900000000000013009","acceptabilityMap":{"900000000000509007":"PREFERRED","900000000000508004":"PREFERRED"},
        #       "type":"SYNONYM","lang":"en","caseSignificance":"CASE_INSENSITIVE","effectiveTime":"20170731"
        #   }],
        synonyms = []
        descriptions = mObj.get('descriptions', [])
        for descOne in descriptions:
            if not descOne['active']:
                continue
            if descOne['type'].upper() != 'SYNONYM' and descOne['lang']=='en':
                continue
            synonyms.append(descOne['term'])

        #   "classAxioms":[...],"gciAxioms":[],
        #   "relationships":[{
        #       "active":true,"released":true,"releasedEffectiveTime":20020131,"relationshipId":"153243021",
        #       "moduleId":"900000000000207008",
        #       "sourceId":"122559001",
        #       "destinationId":"119297000",
        #       "typeId":"116680003",
        #       "type":{"conceptId":"116680003","pt":{"term":"Is a","lang":"en"},"definitionStatus":"PRIMITIVE","fsn":{"term":"Is a (attribute)","lang":"en"},"id":"116680003"},
        #       "target":{
        #           "conceptId":"119297000","pt":{"term":"Blood specimen","lang":"en"},
        #           "definitionStatus":"FULLY_DEFINED",
        #           "fsn":{"term":"Blood specimen (specimen)","lang":"en"},
        #           "id":"119297000"
        #       },"groupId":0,"modifier":"EXISTENTIAL","characteristicType":"INFERRED_RELATIONSHIP","effectiveTime":"20020131","id":"153243021"
        #   },{
        #       "active":true,"released":true,"releasedEffectiveTime":20180131,"relationshipId":"7242649028",
        #       "moduleId":"900000000000207008",
        #       "sourceId":"122559001",
        #       "destinationId":"737087006",
        #       "typeId":"116680003",
        #       "type":{"conceptId":"116680003","pt":{"term":"Is a","lang":"en"},"definitionStatus":"PRIMITIVE","fsn":{"term":"Is a (attribute)","lang":"en"},"id":"116680003"},
        #       "target":{"conceptId":"737087006","pt":{"term":"Specimen from control","lang":"en"},"definitionStatus":"PRIMITIVE","fsn":{"term":"Specimen from control (specimen)","lang":"en"},"id":"737087006"},
        #       "groupId":0,"modifier":"EXISTENTIAL","characteristicType":"INFERRED_RELATIONSHIP",
        #       "effectiveTime":"20180131","id":"7242649028"
        #  },{
        #       "active":true,"released":true,"releasedEffectiveTime":20190731,"relationshipId":"3597535022",
        #       "moduleId":"900000000000207008","sourceId":"122559001","destinationId":"256906008","typeId":"370133003",
        #       "type":{"conceptId":"370133003","pt":{"term":"Specimen substance","lang":"en"},"definitionStatus":"PRIMITIVE","fsn":{"term":"Specimen substance (attribute)","lang":"en"},"id":"370133003"},
        #       "target":{"conceptId":"256906008","pt":{"term":"Blood material","lang":"en"},"definitionStatus":"PRIMITIVE","fsn":{"term":"Blood material (substance)","lang":"en"},"id":"256906008"},
        #       "groupId":1,"modifier":"EXISTENTIAL","characteristicType":"INFERRED_RELATIONSHIP","effectiveTime":"20190731","id":"3597535022"
        #  },{
        #       "active":false,...
        #  }]
        # }
        relations = []
        relationships = mObj.get('relationships',[])
        for relaOne in relationships:
            if not relaOne['active']:
                continue
            x = {
                'code': relaOne['id'],
                'source_code': relaOne['sourceId'],
                'destination_code': relaOne['destinationId'],
                'characteristic_type': relaOne['characteristicType'],
                'type_code': relaOne['type']['conceptId'],
            }
            relations.append(x)

        rst = {
            'code': curCode,
            'en_name': en_name,
            'synonyms': synonyms,
            'relationships': relations
        }
    except Exception as e:
        err = traceback.format_exc()
        print(err)
        rst = None
    return rst

def getChildren(client, curCode):
    try:
        myurl = SNOMED_CT_FULL + '/concepts/{}/children?form=inferred&includeDescendantCount=true'.format(curCode)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
            'Cookie': 'licenseCookie=true; _ga=GA1.2.1549235264.1575442901; _gid=GA1.2.1159893696.1575442901; _iub_cs-7822445=%7B%22consent%22%3Atrue%2C%22timestamp%22%3A%222019-12-04T12%3A53%3A48.847Z%22%2C%22version%22%3A%220.13.24%22%2C%22id%22%3A7822445%7D; _gat=1',
            'Connection': 'keep-alive',
            'Content-Type': 'text/plain;charset=UTF-8',
        }
        client.request('GET', myurl, headers = headers)
        response = client.getresponse()
        result = response.read()
        m = result.decode('utf-8')
        mObj = json.loads(m)

        #[{
        #   "conceptId":"122587005","descendantCount":0,"moduleId":"900000000000207008",
        #   "active":true,"isLeafInferred":true,
        #   "pt":{"term":"Platelet poor plasma specimen from control","lang":"en"},
        #   "definitionStatus":"PRIMITIVE",
        #   "fsn":{"term":"Platelet poor plasma specimen from control (specimen)","lang":"en"},"id":"122587005"
        #}]
        if type(mObj) == list:
            rst = []
            for child in mObj:
                x = child['conceptId']
                rst.append(x)
    except Exception as e:
        err = traceback.format_exc()
        print(err)
        rst = None
    return rst

def deleteConcept(curCode):
    rst = True
    try:
        record = db.session.query(SnomedCtEntity).filter(SnomedCtEntity.code == curCode).first()
        if not record is None:
            db.session.delete(record)

        synonyms = db.session.query(SnomedCtEntitySynonym).filter(SnomedCtEntitySynonym.code == curCode).all()
        if not synonyms is None:
            for synOne in synonyms:
                db.session.delete(synOne)

        relationships = db.session.query(SnomedCtEntityRelationship).filter(SnomedCtEntityRelationship.source_code == curCode).all()
        if not relationships is None:
            for relationOne in relationships:
                db.session.delete(relationOne)

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        err = traceback.format_exc()
        print(err)
        rst = False
    return rst

def updateConcept(curCode, concept, children):
    rst = deleteConcept(curCode)
    if not rst:
        return False

    rst = True
    try:
        isLeaf = 1
        if len(children) > 0:
            isLeaf = 0
        entity = db.session.query(SnomedCtEntity).filter_by(code=concept['code']).first()
        if entity is None:
            entity = SnomedCtEntity(
                code=concept['code'],
                en_name = concept['en_name'],
                cn_name = '',
                is_leaf = isLeaf,
            )
            db.session.add(entity)

        for synonymOne in concept['synonyms']:
            y = db.session.query(SnomedCtEntitySynonym).filter_by(code=concept['code'], text=synonymOne).first()
            if y is None:
                y = SnomedCtEntitySynonym(
                    code = concept['code'],
                    text = synonymOne
                )
                db.session.add(y)

        for relationOne in concept['relationships']:
            x = db.session.query(SnomedCtEntityRelationship)\
                .filter_by(code=relationOne['code'],
                           source_code=relationOne['source_code'],
                           destination_code=relationOne['destination_code'],
                           type_code=relationOne['type_code']).first()
            if x is None:
                x = SnomedCtEntityRelationship(
                    code = relationOne['code'],
                    source_code = relationOne['source_code'],
                    destination_code = relationOne['destination_code'],
                    characteristic_type = relationOne['characteristic_type'],
                    type_code = relationOne['type_code'],
                )
                db.session.add(x)

        db.session.commit()

        print('build {}=> children={}, relationships={}, synonym={}'.format(
            curCode, len(children), len(concept['relationships']), concept['synonyms'])
        )
    except Exception as e:
        db.session.rollback()
        err = traceback.format_exc()
        print(err)
        rst = False

    return rst

def buildThisNode(client, curCode):
    concept = getCurConcept(client, curCode)
    if concept is None:
        concept = getCurConcept(client, curCode)
    children = getChildren(client, curCode)
    if children is None:
        children = getChildren(client, curCode)

    if concept is None or children is None:
        return None

    ok = updateConcept(curCode, concept, children)
    if not ok:
        return None
    return children

IS_A_CODE = '116680003'
def getChildrenCode(curCode):
    childrenCodes = None
    try:
        record = db.session.query(SnomedCtEntity).filter(SnomedCtEntity.code == curCode).first()
        if not record is None:
            if record.is_leaf == 1:
                return []

            rows = db.session.query(SnomedCtEntityRelationship)\
                .filter(SnomedCtEntityRelationship.type_code == IS_A_CODE, SnomedCtEntityRelationship.destination_code == curCode)\
                .all()
            if not rows is None and len(rows)>0:
                childrenCodes = []
                for recordOne in rows:
                    childrenCodes.append(recordOne.source_code)
    except Exception as e:
        db.session.rollback()
        err = traceback.format_exc()
        print(err)
    return childrenCodes

def getSnomedTree(client, startCode, timeGapInSeconds, tryLimit=-1):
    curCode = startCode
    codeStack = []
    newBuildCnt = 0
    while True:
        accessSnomedWeb = False
        childrenCodes = getChildrenCode(curCode)
        if childrenCodes is None:
            childrenCodes = buildThisNode(client, curCode)
            accessSnomedWeb = True
            if not childrenCodes is None:
                newBuildCnt += 1
                if newBuildCnt % 10 == 0:
                    print('--------- new build cnt = {}'.format(newBuildCnt))

#        if childrenCodes is None:
#            break

        if childrenCodes is not None and len(childrenCodes) > 0:
            codeStack.extend(childrenCodes)
        if len(codeStack) == 0:
            print('finish normally!')
            break

        curCode = codeStack.pop(0)

        if accessSnomedWeb:
            time.sleep(timeGapInSeconds)
        if tryLimit>0 and newBuildCnt > tryLimit:
            break
    return

def main():
    client = createClient()
    if client is None:
        return

    startCode = '138875005'
    timeGapInSeconds = 5
    tryLimit = -1
    getSnomedTree(client, startCode, timeGapInSeconds, tryLimit)

    client.close()
    return

if __name__ == "__main__":
    main()
