import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Card, message, Button, Modal, Tag,
	Checkbox, Divider, Radio } from 'antd';

import styles from './Template.less';
let underscore = require('underscore');
import debounce from "lodash/debounce";
import {routerRedux} from 'dva/router';
let moment = require('moment');
import { buildConditionDisplay } from '../Common/Utils';

const TagNameMap = {
	'present': '现病史','physical':'体格检查', 'past':'既往史', 'family':'家族史', 'allergy':'过敏史'
};
function buildPresent(presentTdLines, typeA = null) {
	if (!presentTdLines || presentTdLines.length == 0) {
		return (
			<div style={{height:200}}>
				现病史: 无
			</div>
		);
	}
	// {"present": [{"features": ["鼻塞$symptom#1", "发热$symptom#1", "鼻分泌物异常$symptom#1", "咳嗽$symptom#1", "食欲缺乏$symptom#0", "不适和疲劳$symptom#0", "睡眠异常$symptom#0", "呕吐$symptom#0", "喷嚏$symptom#0", "腹部肿胀$symptom#0"], "rt": {"unit": "day", "value": 0}, "type": "SEG_FORMAT_V1"}]}
	let content = presentTdLines['content'][0];
	let present = null;
	if (content === undefined) {
		present = (
			<div style={{height:200}}>
				现病史: 无
			</div>
		);
	} else if (presentTdLines.type == 'SEG_FORMAT_V1' || typeA == 'SEG_FORMAT_V1') {
		present = (
			<div style={{height:200, overflowY:'auto'}}>
				现病史: {content.features.map( o => <Tag style={{marginBottom:8}}>{o}</Tag>)}
			</div>
		);
	} else if (content.type == 'TEXT' || !content.type || typeA == 'TEXT') {
		present = (<div style={{height:200, overflowY:'auto'}}>现病史: {content.features}</div>);
	}
	return present;
}

function buildPhysicalLearn(selectedItems) {
	// {三凹征: ["阴性"]}
	if (!selectedItems || Object.keys(selectedItems).length == 0) {
		return (
			<div style={{height:200}}>
				体格检查: 无
			</div>
		);
	}
	let items = [];
	for (let k in selectedItems) {
		let data = selectedItems[k];
		let x = (
			<Tag style={{marginBottom:8}}>
				{k}:{data.join(' ')}
			</Tag>
		);
		items.push(x);
	}
	return (
		<div style={{height:200, overflowY:'auto'}}>
			体格检查: {items}
		</div>
	);
}

function buildPhysical(content, typeA) {
	if (!content || content.length == 0 || typeA != 'SEG_FORMAT_V2') {
		return (
			<div style={{height:200}}>
				体格检查: 无
			</div>
		);
	}
	let items = [];
	let lastLabel = '';
	for (let i=0; i<content.length; i++) {
		let curC = content[i];
		if (curC.label) {
			lastLabel = curC.label;
		}
		if (curC.type == 'TEXT') {
			continue;
		}
		let tgts = [];
		for (let j=0; j<curC.value.length; j++) {
			let val = curC.value[j];
			for (let k=0; k<curC.options.length; k++) {
				let curOpt = curC.options[k];
				if (curOpt.value == val) {
					tgts.push(curOpt.label);
				}
			}
		}
		let x = (
			<Tag style={{marginBottom:8}}>
				{lastLabel}:{tgts.join(' ')}
			</Tag>
		);
		items.push(x);
	}
	return (
		<div style={{height:200, overflowY:'auto'}}>
			体格检查: {items}
		</div>
	);
}

@connect(({ doctorTemplateOne }) => ({
	doctorTemplateOne
}))
export default class DoctorTemplateOnePanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showHistory: false,

			showPopup: false,
			mergeType: 'overwrite',
			contentType: '',

			showPhysicalMessage: false,
			physicalMessage: ''
		};
		this.queryDisease = debounce(this.queryDisease, 500);
	}

	componentDidMount() {
		const { dispatch } = this.props;
		let query = this.props.location.query;
		dispatch({
			type: 'doctorTemplateOne/init',
			payload: {
				id: query.id
			}
		});
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea', 'radioGroup'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		}
		curState[tag] = realVal;
		this.setState(curState);
	}

	showTransfer(contentType) {
		this.setState({
			contentType: contentType,
			showPopup: true,
		});
	}

	showDevHistory() {
		this.setState({
			showHistory: true,
		});
	}

	hideDevHistory() {
		this.setState({
			showHistory: false,
		});
	}

	loadVDTemplate() {
		const { dispatch } = this.props;
		const { virtualDept, disease } = this.state;
		dispatch({
			type: 'doctorTemplateOne/loadVDTemplate',
			payload: {
				virtualdept: virtualDept,
				disease: disease,
			}
		});
	}

	queryDisease(keyword) {
		const { dispatch } = this.props;
		const { virtualDept } = this.state;
		dispatch({
			type: 'doctorTemplateOne/queryDisease',
			payload: {
				virtualDepartmentId: virtualDept,
				keyword: keyword,
				page: 1,
				pageSize: 100,
			}
		});
	}

	diffRender(text, record, index) {
		let xObj = {};
		if (text) {
			xObj = text;
		}
		let isDiff = false;
		let items = [];
		for (let k in xObj) {
			// {"allergy": {}, "family": {}, "past": {}, "physical": {},
			// "present": {"drop": ["呕吐$symptom#1"], "add":["咳嗽$symptom#1", "皮疹$symptom#0"]}}
			let kObj = xObj[k];
			let hasDrop = false;
			if (kObj['drop'] && kObj['drop'].length) {
				hasDrop = true;
			}
			let hasAdd = false;
			if (kObj['add'] && kObj['add'].length) {
				hasAdd = true;
			}
			if (hasAdd || hasDrop) {
				isDiff = true;
			}
			let x = (
				<Row>
					<Divider><span style={{color:'blue'}}>{TagNameMap[k]}</span></Divider>
					{hasDrop && <Row style={{marginLeft:10}}>删除: </Row>}
					{hasDrop && <Row>{kObj['drop'].map( o => <Tag color="red" style={{marginBottom:8}}>{o}</Tag>)}</Row>}
					{hasAdd && <Row style={{marginLeft:10}}>添加: </Row>}
					{hasAdd && <Row>{kObj['add'].map( o => <Tag color="green" style={{marginBottom:8}}>{o}</Tag>)}</Row>}
				</Row>
			);
			items.push(x);
		}
		let rst = '无更新';
		if (isDiff) {
			rst = (<div>{items}</div>)
		}
		return rst;
	}

	buildBasicInfo() {
		const { template } = this.props.doctorTemplateOne;
		let comp = (<Row>附加条件: 无</Row>);
		if (template['conditions']) {
			let xObj = JSON.parse(template['conditions']);
			comp = buildConditionDisplay(xObj);
		}
		return (
			<Row>
				<Row>机构: {template['org_name']}</Row>
				<Row>医生: {template['operator_code']}</Row>
				<Row>疾病: {template['diagnosis_code']} : {template['diagnosis']}</Row>
				{comp}
			</Row>
		)
	}

	buildSearchBar() {
		const { vdOpts, diseaseOpts } = this.props.doctorTemplateOne;
		const { virtualDept, disease } = this.state;
		return (
			<Row>
				<Row style={{marginTop:10, marginBottom:10}}>
					虚拟组: <Select style={{width:'70%'}}
					            value={virtualDept}
					            defaultActiveFirstOption={false}
					            showArrow={true} allowClear={true}
					            filterOption={false}
					            onChange={this.onChangeElement.bind(this, 'select', 'virtualDept')}
					>
						{vdOpts.map( o=> <Select.Option key={o.id}>{o.name}</Select.Option>)}
					</Select>
				</Row>
				<Row style={{marginBottom:10}}>
					疾病: <Select style={{width:'70%'}}
					            value={disease}
					            defaultActiveFirstOption={false}
					            showArrow={true} allowClear={true} showSearch
					            filterOption={false} notFoundContent={null}
					            onSearch={this.queryDisease.bind(this)}
					            onChange={this.onChangeElement.bind(this, 'select', 'disease')}
					>
						{diseaseOpts.map( o=> <Select.Option key={o.id}>{o.name}</Select.Option>)}
					</Select>
				</Row>
			</Row>
		);
	}

	buildHistoryPopup() {
		const { history } = this.props.doctorTemplateOne;
		const { showHistory } = this.state;
		const columns = [
			{dataIndex:'updated_at', title:'更新时间', width:'15%'},
			{dataIndex:'difference', title:'更新', render: this.diffRender.bind(this)},
		];
		let footer = (
			<div style={{textAlign:'center'}}>
				<Button type="primary" onClick={this.hideDevHistory.bind(this)}>关闭</Button>
			</div>
		);
		return (
			<Modal visible={showHistory} title="演进历史"
				footer={footer} width={900} closable={false}
			>
				<div style={{height: 600, overflowY:'auto'}}>
					<Table columns={columns}
					       dataSource={history}
					       size="small"
					       pagination={false}
					/>
				</div>
			</Modal>
		);
	}

	buildLeftPart() {
		const { template } = this.props.doctorTemplateOne;
		let extra = (
			<Button type="primary" onClick={this.showDevHistory.bind(this)}>查看演进历史</Button>
		);
		let present = buildPresent(null);
		let physical = buildPhysicalLearn(null);
		if (template['template_vectors']) {
			let xObj = template['template_vectors'];
			present = buildPresent(xObj.present);
			physical = buildPhysicalLearn(xObj.physical_selected_tpl);
		}
		return (
			<Card title="医生模板" extra={extra}>
				{present}
				{physical}
			</Card>
		);
	}

	buildRightPart() {
		const { vdTemplate } = this.props.doctorTemplateOne;
		let extra = (
			<Button type="primary" onClick={this.loadVDTemplate.bind(this)}>加载</Button>
		);
		let present = buildPresent(null);
		let physical = buildPhysical(null);
		if (vdTemplate.present && vdTemplate.present.content) {
			present = buildPresent(vdTemplate.present, vdTemplate.present.type);
		}
		if (vdTemplate.physical && vdTemplate.physical.content) {
			physical = buildPhysical(vdTemplate.physical.content, vdTemplate.physical.type);
		}
		return (
			<Card title="科室模板" extra={extra}>
				{present}
				{physical}
			</Card>
		);
	}

	realTransferPresent() {
		const { dispatch } = this.props;
		const { virtualDept, disease, mergeType} = this.state;
		const { vdTemplate } = this.props.doctorTemplateOne;
		let payload = {
			id: vdTemplate.id,
			mergeType: mergeType,
			virtualDeptId: parseInt(virtualDept),
			diseaseId: parseInt(disease),
			doctorPresentTempId: parseInt(this.props.location.query.id),
			presentTempId: (vdTemplate.presentTempId) ? vdTemplate.presentTempId : 0
		};
		let callback = ::this.loadVDTemplate;
		dispatch({
			type: 'doctorTemplateOne/transfer',
			payload: payload,
			callback: callback
		});
	}

	buildPhysicalMessagePopup() {
		const { showPhysicalMessage, physicalMessage } = this.state;
		return (
			<Modal visible={showPhysicalMessage} title="体格检查模板导入信息"
			       width={500} closable={false}
			       onOk={this.onGoOnTransferPhysical.bind(this, true)}
			       onCancel={this.onGoOnTransferPhysical.bind(this, false)}
			>
				{physicalMessage}
			</Modal>
		)
	}

	onGoOnTransferPhysical(isUpdate) {
		let callback = null;
		if (isUpdate) {
			callback = this.realTransferPhysical.bind(this, 1);
		}
		this.setState({
			showPhysicalMessage: false,
		}, callback);
	}

	showPhysicalTransferInfo(msg) {
		this.setState({
			showPhysicalMessage: true,
			physicalMessage: msg
		});
	}

	realTransferPhysical(force=0) {
		const { dispatch } = this.props;
		const { virtualDept, disease, mergeType } = this.state;
		const { vdTemplate } = this.props.doctorTemplateOne;
		let payload = {
			id: vdTemplate.id,
			mergeType: mergeType,
			virtualDeptId: parseInt(virtualDept),
			diseaseId: parseInt(disease),
			doctorPresentTempId: parseInt(this.props.location.query.id),
			physicalTempId: (vdTemplate.physicalTempId) ? vdTemplate.physicalTempId : 0,
			force: force
		};
		let callback = this.showPhysicalTransferInfo.bind(this);
		if (force == 1) {
			callback = ::this.loadVDTemplate;
		}
		dispatch({
			type: 'doctorTemplateOne/transfer',
			payload: payload,
			callback: callback
		});
	}

	// isValidTransferContent() {
	// 	const { usePresent } = this.state;
	// 	let msgs = [];
	// 	if (!usePresent) {
	// 		msgs.push('请勾选内容!');
	// 	}
	// 	let rst = {
	// 		ok: msgs.length == 0,
	// 		msg: msgs.join(',')
	// 	};
	// 	return rst;
	// }

	onSubmit(isUpdate) {
		const { contentType } = this.state;
		let callback = null;
		if (isUpdate) {
			// let rst = this.isValidTransferContent();
			// if (!rst.ok) {
			// 	message.error(rst.msg);
			// 	return;
			// }
			if (contentType == 'present') {
				callback = this.realTransferPresent.bind(this);
			} else if (contentType == 'physical') {
				callback = this.realTransferPhysical.bind(this);
			}
		}
		this.setState({
			showPopup: false,
		}, callback);
	}

	buildTransferPopup() {
		const { showPopup, contentType, mergeType } = this.state;
		const MergeTypes = [{ label: '合并', value: 'merge' },{ label: '覆盖', value: 'overwrite' },];
		let contentA = contentType == 'present' ? '现病史' : '体格检查';
		return (
			<Modal visible={showPopup} title={"导入"+contentA}
			       width={500} closable={false}
			       onOk={this.onSubmit.bind(this, true)}
			       onCancel={this.onSubmit.bind(this, false)}
			>
				<Divider>方式</Divider>
				<Row>
					<Radio.Group options={MergeTypes}
					             onChange={this.onChangeElement.bind(this, 'radioGroup', 'mergeType')}
					             value={mergeType}
					/>
				</Row>
			</Modal>
		);
	}

	render() {
		return (
			<div style={{minWidth:1000}}>
				<Row gutter={8}>
					<Col span={11}>
						{this.buildBasicInfo()}
					</Col>
					<Col span={11} offset={2}>
						{this.buildSearchBar()}
					</Col>
				</Row>
				<Row gutter={8}>
					<Col span={11}>
						{this.buildLeftPart()}
					</Col>
					<Col span={2} style={{textAlign:'center',alignItems:'center'}}>
						<Row style={{marginTop:100}}>
							<span style={{fontSize:24, cursor:'pointer'}} onClick={this.showTransfer.bind(this, 'present')}>
								<Icon type="double-right" />
							</span>
						</Row>
						<Row style={{marginTop:200}}>
							<span style={{fontSize:24, cursor:'pointer'}} onClick={this.showTransfer.bind(this, 'physical')}>
								<Icon type="double-right" />
							</span>
						</Row>
					</Col>
					<Col span={11}>
						{this.buildRightPart()}
					</Col>
				</Row>
				{this.buildHistoryPopup()}
				{this.buildTransferPopup()}
				{this.buildPhysicalMessagePopup()}
			</div>
		);
	}
}
