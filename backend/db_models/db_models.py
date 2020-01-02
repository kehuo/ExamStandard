from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, autoincrement=True, primary_key=True)
    # org_code = Column(String(64), nullable=False, default=0, comment='0普通,1管理员')
    role_id = Column(Integer, nullable=False)
    name = Column(String(64), nullable=False)
    password = Column(String(64), nullable=False)
    fullname = Column(String(64), nullable=False)
    email = Column(String(64), nullable=True, default=0)
    # real_dept_id = Column(Integer, nullable=True)
    disabled = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Integer, nullable=False, default=0)


class ReportTaggingSamples(Base):
    __tablename__ = "report_tagging_samples"
    id = Column(Integer, autoincrement=True, primary_key=True)
    uuid = Column(String(64), nullable=True)
    diagnosis = Column(Text, nullable=False, default="")
    diagnosis_tag = Column(Text, nullable=False, default="")
    content = Column(Text, nullable=False)
    content_tag = Column(Text, nullable=False)
    type = Column(String(11), nullable=True, default="")
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, nullable=False)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Integer, nullable=False)


class RamdisCases(Base):
    __tablename__ = "ramdis_cases"
    id = Column(Integer, autoincrement=True, primary_key=True)
    patient_id = Column(String(256), nullable=True)
    country = Column(String(256), nullable=True)
    age_of_diagnosis = Column(String(256), nullable=True)
    diagnosis = Column(String(256), nullable=True)
    age_of_symptoms_onset = Column(String(256), nullable=True)
    date_of_entry = Column(String(256), nullable=True)
    coauthor = Column(String(256), nullable=True)
    found_in_newborn = Column(String(256), nullable=True)
    diagnosis_confirmed = Column(String(256), nullable=True)
    ethnic_origin = Column(String(256), nullable=True)
    author = Column(String(256), nullable=True)
    history = Column(Text, nullable=True)
    gender = Column(String(256), nullable=True)
    hospital = Column(String(256), nullable=True)
    cn_context = Column(Text, nullable=True)
    confidence = Column(String(256), nullable=False)
    memo = Column(Text, nullable=True)


class Radlex(Base):
    __tablename__ = "radlex"
    id = Column(Integer, autoincrement=True, primary_key=True)
    rid = Column(String(64), nullable=False)
    en_name = Column(String(256), nullable=True, default="")
    cn_name = Column(String(256), nullable=True, default="")
    parent_id = Column(Integer, nullable=True)
    parent_rid = Column(String(64), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Integer, nullable=False, default=0)


class Loinc(Base):
    __tablename__ = "loinc"
    id = Column(Integer, autoincrement=True, primary_key=True)
    class_x = Column(String(256), nullable=True, default="")
    component = Column(String(256), nullable=True, default="")
    loinc_number = Column(String(256), nullable=True, default="")
    method_typ = Column(String(256), nullable=True, default="")
    property = Column(String(256), nullable=True, default="")
    scale_typ = Column(String(256), nullable=True, default="")
    system = Column(String(256), nullable=True, default="")
    time_aspect = Column(String(256), nullable=True, default="")
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Integer, nullable=False, default=0)


class LoincObjMapping(Base):
    __tablename__ = "loinc_obj_mapping"
    id = Column(Integer, autoincrement=True, primary_key=True)
    src = Column(String(256), nullable=True, default="")
    dst = Column(String(256), nullable=True, default="")
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Integer, nullable=False, default=0)


class LoincStep0Mapping(Base):
    __tablename__ = "loinc_step0_mapping"
    id = Column(Integer, autoincrement=True, primary_key=True)
    src = Column(String(256), nullable=True, default="")
    dst = Column(String(256), nullable=True, default="")
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Integer, nullable=False, default=0)


class RadlexNameMapping(Base):
    __tablename__ = "radlex_name_mapping"
    id = Column(Integer, autoincrement=True, primary_key=True)
    tag_type = Column(String(32), nullable=True, default="")
    src = Column(String(256), nullable=True, default="")
    dst = Column(String(256), nullable=True, default="")
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Integer, nullable=False, default=0)


class FMAEntity(Base):
    __tablename__ = "fma_entity"
    id = Column(Integer, autoincrement=True, primary_key=True)
    code = Column(String(64), nullable=False)
    en_name = Column(String(256), nullable=True, default="")
    cn_name = Column(String(256), nullable=True, default="")
    parent_id = Column(Integer, nullable=True)
    parent_code = Column(String(64), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Integer, nullable=False, default=0)


class SnomedCtEntity(Base):
    __tablename__ = "snomed_ct_entity"
    id = Column(Integer, autoincrement=True, primary_key=True)
    code = Column(String(64), nullable=False)
    en_name = Column(String(256), nullable=True, default="")
    cn_name = Column(String(256), nullable=True, default="")
    is_leaf = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Integer, nullable=False, default=0)


class SnomedCtEntityRelationship(Base):
    __tablename__ = "snomed_ct_entity_relationship"
    id = Column(Integer, autoincrement=True, primary_key=True)
    code = Column(String(64), nullable=False)
    source_code = Column(String(64), nullable=False)
    destination_code = Column(String(64), nullable=False)
    characteristic_type = Column(String(64), nullable=False)
    type_code = Column(String(64), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Integer, nullable=False, default=0)


class SnomedCtEntitySynonym(Base):
    __tablename__ = "snomed_ct_entity_synonym"
    id = Column(Integer, autoincrement=True, primary_key=True)
    code = Column(String(64), nullable=False)
    text = Column(String(256), nullable=False)
    cn_text = Column(String(256), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Integer, nullable=False, default=0)


class Kidney(Base):
    __tablename__ = "kidney"
    id = Column(Integer, autoincrement=True, primary_key=True)
    kid = Column(String(64), nullable=False)
    en_name = Column(String(256), nullable=True, default="")
    cn_name = Column(String(256), nullable=True, default="")
    parent_id = Column(Integer, nullable=True)
    parent_kid = Column(String(64), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Integer, nullable=False, default=0)


class KidneyNameMapping(Base):
    __tablename__ = "kidney_name_mapping"
    id = Column(Integer, autoincrement=True, primary_key=True)
    tag_type = Column(String(32), nullable=True, default="")
    src = Column(String(256), nullable=True, default="")
    dst = Column(String(256), nullable=True, default="")
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    created_by = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    updated_by = Column(Integer, nullable=False, default=0)
