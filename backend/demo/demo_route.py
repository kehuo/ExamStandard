from common.utils.http import app_url
from demo.demo_service import DemoList, DemoOne

from demo.service_rare_disease import RamdisList, RamdisOne

from demo.service_loinc import LoincList, LoincOne
from demo.service_radlex import RadlexList, RadlexOne, RadlexParent

from demo.service_radlex_mapping import RadlexMappingList, RadlexMappingOne
from demo.service_loinc_obj_mapping import LoincObjMappingList, LoincObjMappingOne
from demo.service_loinc_step0_mapping import LoincStep0MappingList, LoincStep0MappingOne

from demo.service_fma import FMAList, FMAOne, FMAParent
from demo.service_snomed_ct import SnomedCtList, SnomedCtOne, SnomedCtOneByCode

def demo_route(api, version, model):
    api.add_resource(DemoList, app_url(version, model, "/demo"))
    api.add_resource(DemoOne, app_url(version, model, '/demo/<string:demoId>'))

    api.add_resource(RamdisList, app_url(version, model, "/ramdis"))
    api.add_resource(RamdisOne, app_url(version, model, '/ramdis/<int:caseId>'))

    api.add_resource(LoincList, app_url(version, model, "/loinc"))
    api.add_resource(LoincOne, app_url(version, model, '/loinc/<int:itemId>'))

    api.add_resource(RadlexList, app_url(version, model, "/radlex"))
    api.add_resource(RadlexOne, app_url(version, model, '/radlex/<int:itemId>'))
    api.add_resource(RadlexParent, app_url(version, model, '/radlex-parent'))

    api.add_resource(RadlexMappingList, app_url(version, model, "/radlex-mapping"))
    api.add_resource(RadlexMappingOne, app_url(version, model, '/radlex-mapping/<int:itemId>'))

    api.add_resource(LoincObjMappingList, app_url(version, model, "/loinc-obj-mapping"))
    api.add_resource(LoincObjMappingOne, app_url(version, model, '/loinc-obj-mapping/<int:itemId>'))

    api.add_resource(LoincStep0MappingList, app_url(version, model, "/loinc-step0-mapping"))
    api.add_resource(LoincStep0MappingOne, app_url(version, model, '/loinc-step0-mapping/<int:itemId>'))

    api.add_resource(FMAList, app_url(version, model, "/fma"))
    api.add_resource(FMAOne, app_url(version, model, '/fma/<int:itemId>'))
    api.add_resource(FMAParent, app_url(version, model, '/fma-parent'))

    api.add_resource(SnomedCtList, app_url(version, model, "/snomed-ct"))
    api.add_resource(SnomedCtOne, app_url(version, model, '/snomed-ct/<int:itemId>'))
    api.add_resource(SnomedCtOneByCode, app_url(version, model, '/snomed-ct-code/<string:code>'))

    return
