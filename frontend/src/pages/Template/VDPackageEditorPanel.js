import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Divider, Button, Card, Collapse, Tag, message, Modal } from 'antd';
import {routerRedux} from 'dva/router';
let underscore = require('underscore');
let moment = require('moment');
import { stringify } from 'qs';
import CurrentHistoryEditor from './CurrentHistoryEditor';
import PhysicalExamEditor from './PhysicalExamEditor';
import PackageConditionCard from './PackageConditionCard';
import MultiTextTemplateEditor from './MultiTextTemplateEditor';
import styles from './Template.less';

@connect(({ vdPackageOne }) => ({
	vdPackageOne,
}))
export default class VDPackageEditorPanel extends React.Component {
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
		let webPath = `/template/vd-package-list`;
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
			type: 'vdPackageOne/fetch',
			payload: {
				id: query.id,
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
		// 	"id": 305,
		// 	"packageId": 1,
		// 	"virtualDepartmentId": 2,
		//
		//  "conditions": "{"age":{"start_val":1,"start_unit":"month","end_val":2,"end_unit":"month"},"gender":"M"}",
		//
		// 	"presentTempId": 0,
		// 	"pastTempId": 0,
		// 	"familyTempId": 0,
		// 	"allergyTempId": 0,
		// 	"physicalTempId": 480,
		//
		// 	"present": {
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
		// },
		// "family": {
		// }
		// "past": {
		// }
	}

	onItemSearch(keyword, callback) {
		const { dispatch } = this.props;
		dispatch({
			type: 'vdPackageOne/queryItem',
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
		const updateTags = ['id', 'packageId','virtualDepartmentId',
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
		let physicalType = (typeof physicalExamContent =='string')? 'TEXT':'SEG_FORMAT_V2';
		let conditionsContent = this.refs['conditionRef'].collect();
		let conditions = null;
		if (conditionsContent) {
			conditions = JSON.stringify(conditionsContent);
		}

		let payload = {
			'id': packageInfo.id,
			'packageId': packageInfo.packageId,
			'virtualDepartmentId': packageInfo.virtualDepartmentId,
			'conditions': conditions,
			'presentTempId': packageInfo.presentTempId,
			'physicalTempId': packageInfo.physicalTempId,
			'pastTempId': packageInfo.pastTempId,
			'familyTempId': packageInfo.familyTempId,
			'allergyTempId': packageInfo.allergyTempId,
			'present': {},
			'physical': {
				'category': 'PHYSICAL',
				'type': physicalType,
				'content': physicalExamContent,
			}
		};

		const TemplateKeys = [
			{tag:'family', IdTag:'familyTempId'},
			{tag:'allergy', IdTag:'allergyTempId'},
			{tag:'past', IdTag:'pastTempId'}
		];
		// let others = this.refs['othersRef'].collect();
		for (let i=0; i<TemplateKeys.length; i++) {
			let key = TemplateKeys[i].tag;
			let idKey = TemplateKeys[i].IdTag;
			let content = '';   //others[key]
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
			type: 'vdPackageOne/editPackage',
			payload: payload,
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
		const { dispatch } = this.props;
		const { packageInfo } = this.state;
		dispatch({
			type: 'vdPackageOne/getPreview',
			payload: {
				mode: mode,
				content: content,
				virtualDeptId: parseInt(packageInfo.virtualDepartmentId)
			},
			callback: callback
		});
	}

	onChangePackageInfo(tag, val) {
		let packageInfo = this.state.packageInfo;
		packageInfo[tag] = val;
		this.setState({
			packageInfo: packageInfo
		});
	}
	
	buildBasicNames() {
		const { packageInfo } = this.state;
		const  { virtualDepartments } = this.props.vdPackageOne;
		return (
			<Col span={9}>
				<Row>
					<Select style={{width:'100%'}}
					        value={packageInfo.virtualDepartmentId + ''}
					        placeholder="请选择虚拟组"
					        defaultActiveFirstOption={false}
					        showArrow={true}
					        filterOption={false}
					        onChange={this.onChangePackageInfo.bind(this, 'virtualDepartmentId')}
					>
						{virtualDepartments.map( o=> <Select.Option key={o.id}>{o.name}</Select.Option>)}
					</Select>
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
			type: 'vdPackageOne/fetch',
			payload: {
				id: packageId,
			},
			callback: callback
		});
	}

	fetchListData(params, callback) {
		const { dispatch } = this.props;
		dispatch({
			type: 'vdPackageOne/fetchPackageList',
			payload: params,
			callback: callback
		});
	}

	buildPhysicalExam() {
		const { packageInfo, finishInit } = this.state;
		return (
			<PhysicalExamEditor ref="physicalExamRef"
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

	render() {
		return (
			<div style={{width:1000, margin:'auto', backgroundColor:'white', padding:20}}>
				{this.buildBasicInfo()}
				{this.buildPhysicalExam()}
				{this.buildOpButtons()}
				{this.buildConfirmPopup()}
			</div>
		);
	}
}
