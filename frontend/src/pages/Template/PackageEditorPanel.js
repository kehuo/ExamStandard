import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Divider, Button, Card, Collapse, Tag, message, Modal } from 'antd';
import {routerRedux} from 'dva/router';
let underscore = require('underscore');
let moment = require('moment');
import { stringify } from 'qs';
import CurrentHistoryEditor from './CurrentHistoryEditor';
import PhysicalExamEditor2 from './PhysicalExamEditor2';
import PackageConditionCard from './PackageConditionCard';
import MultiTextTemplateEditor from './MultiTextTemplateEditor';
import MiscTextTemplateEditor from './MiscTextTemplateEditor';

import styles from './Template.less';

@connect(({ packageOne }) => ({
	packageOne,
}))
export default class PackageEditorPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// basic info
			packageInfo: {},
			query: {},
			finishInit: false,
			showReConfirm: false,
		};
	}

	componentDidMount() {
		let query = this.props.location.query;
		this.setState({
			query: query
		}, this.getPackageOne.bind(this));
	}

	goBackListPage() {
		const { query } = this.state;
		let webPath = `/template/package-list`;
		let queryA = JSON.parse(JSON.stringify(query));
		queryA.ts = moment().valueOf();
		webPath += `?${stringify(queryA)}`;
		this.props.dispatch(routerRedux.push(webPath));
	}

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState);
	}

	getPackageOne() {
		const { dispatch } = this.props;
		const { query } = this.state;
		let callback = this.updatePackageInfo.bind(this);
		dispatch({
			type: 'packageOne/fetch',
			payload: {
				id: query.id,
				diseaseId: query.diseaseId,
				virtualDeptId: query.virtualDeptId,
			},
			callback: callback
		});
	}

	updatePackageInfo(data) {
		const {query} = this.state;
		if (query.id == '0') {
			data.id = 0;
		}
		this.setState({
			packageInfo: data,
			finishInit: true,
		});
		// let x = {
		// 	"packageId": 305,
		// 	"status": 1,
		// 	"ownerType": "department",
		// 	"ownerId": 1,
		// 	"orgCode": "00000001",
		//
		// 	"diseaseName": "1型糖尿病",
		// 	"diseaseId": 13506,
		// 	"diseaseCode": "E10.900",
		// 	"diseaseSystemName": "泌尿系统",
		//  "conditions": "{"age":{"start_val":1,"start_unit":"month","end_val":2,"end_unit":"month"},"gender":"M"}",
		//
		// 	"presentTempId": 320,
		// 	"pastTempId": 0,
		// 	"familyTempId": 0,
		// 	"allergyTempId": 0,
		// 	"physicalTempId": 480,
		//
		// 	"present": {
		// 		"id": 320,
		// 		"category": "PRESENT",
		// 		"type": "SEG_FORMAT_V1",
		// 		"description": ""
		// 		"content": [{
		// 			"rt": {"unit": "day", "value": 0},
		// 			"features": ["大便$有", "咳嗽$无"]
		// 		}],
		// 	},
		//
		// 	"physical": {
		// 		"id": 480,
		// 		"category": "PHYSICAL",
		// 		"type": "SEG_FORMAT_V1",
		// 		"description": "",
		// 		"content": [
		// 			{"type": "TEXT", "description": "℃", "label": "T-体温", "value": ""},
		// 			{
		// 				"type": "CHECKBOX",
		// 				"options": [{
		// 					"props": {"color": "FF00B050"},
		// 					"display": "手足末端温暖",
		// 					"key": "温暖",
		// 					"value": "0",
		// 					"label": "温暖",
		// 					"addition": null
		// 				}, {
		// 					"props": {"color": "FFFF0000"},
		// 					"display": "手足末端稍凉",
		// 					"key": "稍凉",
		// 					"value": "1",
		// 					"label": "稍凉",
		// 					"addition": null
		// 				}, {
		// 					"props": {"color": "FFFF0000"},
		// 					"display": "手足末端凉",
		// 					"key": "凉",
		// 					"value": "2",
		// 					"label": "凉",
		// 					"addition": null
		// 				}],
		// 				"description": " ",
		// 				"label": "手足末端",
		// 				"value": ["2"]
		// 			},
		// 		]
		// 	},
		// "allergy": {
		// 		"id": 320,
		// 		"category": "ALLERGY",
		// 		"type": "TEXT",
		// 		"description": ""
		// 		"content": "山药1",
		// },
		// "family": {
		// 		"id": 320,
		// 		"category": "FAMILY",
		// 		"type": "TEXT",
		// 		"description": ""
		// 		"content": "山药2",
		// }
		// "past": {
		// 		"id": 320,
		// 		"category": "PAST",
		// 		"type": "TEXT",
		// 		"description": ""
		// 		"content": "山药3",
		// }
	}

	onSearchSymptoms(keyword, callback) {
		const { dispatch } = this.props;
		dispatch({
			type: 'packageOne/querySymptom',
			payload: {
				keyword: keyword,
				page: 1,
				pageSize: 200,
			},
			callback: callback
		});
	}

	onItemSearch(keyword, callback) {
		const { dispatch } = this.props;
		dispatch({
			type: 'packageOne/queryItem',
			payload: {
				keyword: keyword,
				page: 1,
				pageSize: 200,
			},
			callback: callback
		});
	}

	editProcessChain(goNext, existPackageInfo) {
		if (goNext) {
			this.goBackListPage();
			return;
		}
		let packageInfo = this.state;
		const updateTags = ['id', 'packageId','status','ownerType', 'ownerId', 'orgCode',
			'diseaseName', 'diseaseId', 'diseaseCode', 'diseaseSystemName',
			'presentTempId', 'pastTempId', 'familyTempId', 'allergyTempId', 'physicalTempId'];
		for (let i=0; i<updateTags.length; i++) {
			let tag = updateTags[i];
			packageInfo[tag] = existPackageInfo[tag];
		}
		this.setState({
			showReConfirm: true,
			packageInfo: packageInfo
		});
	}

	buildCurrentPackageInfo() {
		const { packageInfo } = this.state;

		let physicalExamContent = this.refs['physicalExamRef'].collect();
		let currentHistoryContent = this.refs['currentHistoryRef'].collect();
		let physicalType = (typeof physicalExamContent =='string')? 'TEXT':'SEG_FORMAT_V2';
		let conditionsContent = this.refs['conditionRef'].collect();
		let conditions = null;
		if (conditionsContent) {
			conditions = JSON.stringify(conditionsContent);
		}
		let miscContent = this.refs['miscRef'].collect();

		let payload = {
			'id': packageInfo.id,
			'packageId': packageInfo.packageId,
			'ownerType': packageInfo.ownerType,
			'ownerId': packageInfo.ownerId,
			'diseaseId': packageInfo.diseaseId,
			'diseaseName': packageInfo.diseaseName,
			'diseaseCode': packageInfo.diseaseCode,
			'diseaseSystemName': packageInfo.diseaseSystemName,
			'conditions': conditions,
			'presentTempId': packageInfo.presentTempId,
			'physicalTempId': packageInfo.physicalTempId,
			'pastTempId': packageInfo.pastTempId,
			'familyTempId': packageInfo.familyTempId,
			'allergyTempId': packageInfo.allergyTempId,
			'present': {
				'category': 'PRESENT',
				'type': currentHistoryContent.type,
				'content': currentHistoryContent.content,
			},
			'physical': {
				'category': 'PHYSICAL',
				'type': physicalType,
				'content': physicalExamContent,
			},
			'miscTempId': packageInfo.miscTempId,
			'misc': miscContent,
		};

		const TemplateKeys = [
			{tag:'family', IdTag:'familyTempId'},
			{tag:'allergy', IdTag:'allergyTempId'},
			{tag:'past', IdTag:'pastTempId'}
		];
		let others = this.refs['othersRef'].collect();
		for (let i=0; i<TemplateKeys.length; i++) {
			let key = TemplateKeys[i].tag;
			let idKey = TemplateKeys[i].IdTag;
			let content = others[key];
			if (!payload[idKey]) {
				payload[idKey] = 0;
			}
			payload[key] = {
				'category': key.toUpperCase(),
				'type': 'TEXT',
				'content': content,
			};
		}
		return payload;
	}

	realEditPackage() {
		const { dispatch } = this.props;
		const { query } = this.state;
		let callback = this.editProcessChain.bind(this);
		let payload = this.buildCurrentPackageInfo();
		dispatch({
			type: 'packageOne/editPackage',
			payload: {
				virtualdept: parseInt(query.virtualDeptId),
				data: payload
			},
			callback: callback
		});
	}

	onSubmit(isUpdate) {
		if(!isUpdate) {
			this.goBackListPage();
			return;
		}

		this.setState({
			showReConfirm: false,
		}, this.realEditPackage.bind(this));
	}

	onPreview(mode, content, callback) {
		const { query } = this.state;
		const { dispatch } = this.props;
		dispatch({
			type: 'packageOne/getPreview',
			payload: {
				mode: mode,
				content: content,
				virtualDeptId: query.virtualDeptId
			},
			callback: callback
		});
	}

	buildBasicNames() {
		const { packageInfo } = this.state;
		let name1 = '无';
		if (packageInfo.diseaseCode || packageInfo.diseaseName) {
			name1 = packageInfo.diseaseCode + ' : ' + packageInfo.diseaseName;
		}
		let name2 = packageInfo.diseaseSystemName? packageInfo.diseaseSystemName: '无';
		return (
			<Col span={9}>
				<Row>
					<Col span={6} className={styles.text_align_right} style={{fontWeight:'bold'}}>
						{'疾病名称: '}
					</Col>
					<Col span={17}>
						{name1}
					</Col>
				</Row>
				<Row>
					<Col span={6} className={styles.text_align_right}  style={{fontWeight:'bold'}}>
						{'所属系统: '}
					</Col>
					<Col span={17}>
						{name2}
					</Col>
				</Row>
			</Col>
		);
	}

	buildBasicCondition() {
		const { packageInfo, finishInit } = this.state;
		return (
			<Col span={15}>
				<PackageConditionCard ref="conditionRef"
				                      init={finishInit}
				                      data={packageInfo.conditions}/>
			</Col>
		);
	}

	buildBasicInfo() {
		const bodyStyle = {padding:8};
		return (
			<Card title="基本信息" bodyStyle={bodyStyle}>
				<Row>
					{this.buildBasicNames()}
					{this.buildBasicCondition()}
				</Row>
			</Card>
		);
	}

	onGetRefPackage(packageId, callback) {
		const { dispatch } = this.props;
		dispatch({
			type: 'packageOne/fetch',
			payload: {
				id: packageId,
			},
			callback: callback
		});
	}

	fetchListData(params, callback) {
		const { dispatch } = this.props;
		dispatch({
			type: 'packageOne/fetchPackageList',
			payload: params,
			callback: callback
		});
	}

	buildCurrentHistory() {
		const { packageInfo, finishInit } = this.state;
		return (
			<CurrentHistoryEditor ref="currentHistoryRef"
				template={packageInfo.present}
				init={finishInit}
                onPreview={this.onPreview.bind(this, 'currentHistory')}
                onSearchSymptoms={this.onSearchSymptoms.bind(this)}
                onGetPackage={this.onGetRefPackage.bind(this)}
                fetchListData={this.fetchListData.bind(this)}
			/>
		);
	}

	buildPhysicalExam() {
		const { packageInfo, finishInit } = this.state;
		return (
			<PhysicalExamEditor2 ref="physicalExamRef"
				template={packageInfo.physical}
				init={finishInit}
                onPreview={this.onPreview.bind(this, 'physicalExam')}
                onItemSearch={this.onItemSearch.bind(this)}
                onGetPackage={this.onGetRefPackage.bind(this)}
                fetchListData={this.fetchListData.bind(this)}
			/>
		);
	}

	buildOpButtons() {
		return (
			<Row style={{textAlign:'center', marginTop:8}}>
				<Button style={{marginRight:20}} type="primary" onClick={this.onSubmit.bind(this, true)}>
					提交</Button>
				<Button onClick={this.onSubmit.bind(this, false)}>
					取消</Button>
			</Row>
		)
	}

	buildConfirmPopup() {
		const {showReConfirm} = this.state;
		return (
			<Modal visible={showReConfirm} closable={false}
			       onCancel={this.onSubmit.bind(this, false)}
			       onOk={this.onSubmit.bind(this, true)}
			>
				该模板已经存在,是否覆盖?
			</Modal>
		);
	}

	buildOtherTemplates() {
		const { packageInfo, finishInit } = this.state;
		return (
			<MultiTextTemplateEditor ref="othersRef"
				template={packageInfo}
				init={finishInit}
			/>
		);
	}

	buildMiscTemplates() {
		const { packageInfo, finishInit } = this.state;
		return  (
			<MiscTextTemplateEditor ref="miscRef"
				misc = {packageInfo.misc}
			    init = {finishInit}
			/>
		);
	}

	render() {
		return (
			<div style={{width:1000, margin:'auto', backgroundColor:'white', padding:20}}>
				{this.buildBasicInfo()}
				{this.buildCurrentHistory()}
				{this.buildPhysicalExam()}
				{this.buildOtherTemplates()}
				{this.buildMiscTemplates()}
				{this.buildOpButtons()}
				{this.buildConfirmPopup()}
			</div>
		);
	}
}
