DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `org_code` varchar(64) NOT NULL DEFAULT '' COMMENT '机构代码',
  `role_id` int(11) NOT NULL COMMENT '角色id',
  `name` varchar(64) NOT NULL COMMENT '用户账号',
  `password` varchar(64) NOT NULL DEFAULT '' COMMENT '用户密码',
  `fullname` varchar(64) NOT NULL COMMENT '用户姓名',
  `email` varchar(64) DEFAULT '' COMMENT '电子邮箱',
  `real_dept_id` int(11) unsigned DEFAULT NULL COMMENT '用户所在真实部门id',
  `disabled` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `report_tagging_samples`;
CREATE TABLE `report_tagging_samples` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(64) NOT NULL,
  `diagnosis` text COMMENT "诊断结果文本",
  `diagnosis_tag` text COMMENT "诊断结果标注",
  `content` text COMMENT "镜下所见文本",
  `content_tag` text COMMENT "镜下所见标注",
  `type` varchar(11) DEFAULT "" COMMENT "类型, 如肾病理报告",
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) unsigned NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uni_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='检查报告';


DROP TABLE IF EXISTS `radlex`;
CREATE TABLE `radlex` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rid` varchar(64) NOT NULL DEFAULT '' COMMENT 'radlex编码',
  `en_name` varchar(256) NOT NULL DEFAULT '' COMMENT '英文名',
  `cn_name` varchar(256) NOT NULL DEFAULT '' COMMENT '中文名',
  `parent_id` int(11) DEFAULT NULL,
  `parent_rid` varchar(64) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `rid_uni` (`rid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `loinc`;
CREATE TABLE `loinc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_x` varchar(64) NOT NULL DEFAULT '',
  `component` varchar(256) NOT NULL DEFAULT '',
  `loinc_number` varchar(256) NOT NULL DEFAULT '',
  `method_typ` varchar(256) NOT NULL DEFAULT '',
  `property` varchar(256) NOT NULL DEFAULT '',
  `scale_typ` varchar(256) NOT NULL DEFAULT '',
  `system` varchar(256) NOT NULL DEFAULT '',
  `time_aspect` varchar(256) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `lonic_uni` (`loinc_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `loinc_obj_mapping`;
CREATE TABLE `loinc_obj_mapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `src` varchar(256) NOT NULL,
  `dst` varchar(256) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `lonic_obj_mapping_uni` (`src`, `dst`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `loinc_step0_mapping`;
CREATE TABLE `loinc_step0_mapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `src` varchar(256) NOT NULL,
  `dst` varchar(512) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `lonic_step0_mapping_uni` (`src`, `dst`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `radlex_name_mapping`;
CREATE TABLE `radlex_name_mapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_type` varchar(32) NOT NULL,
  `src` varchar(256) NOT NULL,
  `dst` varchar(256) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `radlex_name_mapping_uni` (`tag_type`, `src`, `dst`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `ramdis_cases`;
CREATE TABLE `ramdis_cases` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `country` varchar(256) DEFAULT NULL,
  `age_of_diagnosis` varchar(256) DEFAULT NULL,
  `diagnosis` varchar(256) DEFAULT NULL,
  `patient_id` varchar(256) DEFAULT NULL,
  `age_of_symptoms_onset` varchar(256) DEFAULT NULL,
  `date_of_entry` varchar(256) DEFAULT NULL,
  `coauthor` varchar(256) DEFAULT NULL,
  `found_in_newborn` varchar(256) DEFAULT NULL,
  `diagnosis_confirmed` varchar(256) DEFAULT NULL,
  `ethnic_origin` varchar(256) DEFAULT NULL,
  `author` varchar(256) DEFAULT NULL,
  `history` text,
  `confidence` varchar(256) DEFAULT '未确认',
  `memo` text,
  `gender` varchar(256) DEFAULT NULL,
  `hospital` varchar(256) DEFAULT NULL,
  `cn_context` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `fma_entity`;
CREATE TABLE `fma_entity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL DEFAULT '' COMMENT '编码',
  `en_name` varchar(256) NOT NULL DEFAULT '' COMMENT '英文名',
  `cn_name` varchar(256) NOT NULL DEFAULT '' COMMENT '中文名',
  `parent_id` int(11) DEFAULT NULL,
  `parent_code` varchar(64) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `fma_uni` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



DROP TABLE IF EXISTS `snomed_ct_entity`;
CREATE TABLE `snomed_ct_entity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL DEFAULT '' COMMENT '编码',
  `en_name` varchar(256) NOT NULL DEFAULT '' COMMENT '英文名',
  `cn_name` varchar(256) NOT NULL DEFAULT '' COMMENT '中文名',
  `is_leaf` int(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `snomed_ct_entity_uni` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `kidney`;
CREATE TABLE `kidney` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kid` varchar(64) NOT NULL DEFAULT '' COMMENT 'kidney编码',
  `en_name` varchar(256) NOT NULL DEFAULT '' COMMENT '英文名',
  `cn_name` varchar(256) NOT NULL DEFAULT '' COMMENT '中文名',
  `parent_id` int(11) DEFAULT NULL,
  `parent_kid` varchar(64) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uni_kid` (`kid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `snomed_ct_entity_relationship`;
CREATE TABLE `snomed_ct_entity_relationship` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL DEFAULT '' COMMENT '关系编码',
  `source_code` varchar(64) NOT NULL DEFAULT '',
  `destination_code` varchar(64) NOT NULL DEFAULT '',
  `characteristic_type` varchar(64) NOT NULL DEFAULT '',
  `type_code` varchar(64) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `snomed_ct_entity_relationship_uni` (`code`, `source_code`, `destination_code`, `type_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



DROP TABLE IF EXISTS `kidney_name_mapping`;
CREATE TABLE `kidney_name_mapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_type` varchar(32) NOT NULL,
  `src` varchar(256) NOT NULL,
  `dst` varchar(256) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `kidney_name_mapping_uni` (`tag_type`, `src`, `dst`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



DROP TABLE IF EXISTS `snomed_ct_entity_synonym`;
CREATE TABLE `snomed_ct_entity_synonym` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL DEFAULT '' COMMENT '关系编码',
  `text` varchar(256) NOT NULL DEFAULT '',
  `cn_text` varchar(256) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) NOT NULL DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `snomed_ct_entity_synonym_uni` (`code`, `text`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
