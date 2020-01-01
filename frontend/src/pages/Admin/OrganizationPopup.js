import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Org.less";
import { connect } from "dva/index";

@connect(({ organization }) => ({
  organization
}))
export default class OrganizationPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			code: '',
			name: '',
			certificate: '',
			org_level: '',
			auto_update: 1,
			source_id: '',
			exam_source_id: '',
			medicine_source_id: '',
			disabled: false,
            genCode: '',
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.code = item.code;
			newState.name = item.name;
			newState.certificate = item.certificate;
			newState.org_level = item.org_level;
			newState.auto_update = item.auto_update;
			if (item.source_id) {
				newState.source_id = '' + item.source_id;
			}
			if (item.exam_source_id) {
				newState.exam_source_id = '' + item.exam_source_id;
			}
			if (item.medicine_source_id) {
				newState.medicine_source_id = '' + item.medicine_source_id;
			}
			newState.disabled = (item.disabled == 1);
		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps.item);
		this.setState(newState);
	}

	onSubmit(isUpdate) {
		const { id, name, code, certificate, source_id, exam_source_id, medicine_source_id, org_level,
			auto_update, disabled } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!name || !code || !source_id || !exam_source_id || !medicine_source_id) {
			message.error('请检查名称、代码、疾病数据源、检查数据源、药品数据源等信息!');
			return;
		}
		let x = {
			id: id,
			name: name,
			code: code,
			certificate: certificate,
			source_id: parseInt(source_id),
			exam_source_id: parseInt(exam_source_id),
			medicine_source_id: parseInt(medicine_source_id),
			org_level: org_level,
			auto_update: auto_update,
			disabled: (disabled? 1: 0),
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['code','name','certificate'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

  onGenerateCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'organization/genCode',
      payload: {},
      callback: this.updateGenCode.bind(this)
    });
  }

  updateGenCode(genCode) {
    this.setState({
      // certificate: genCode,
      genCode: genCode
    });
  }

	render() {
		const {id, name, code, certificate, source_id, exam_source_id, medicine_source_id, org_level,
			auto_update, disabled,genCode } = this.state;
		const { visible, diseaseDataSourceOptions, examDataSourceOptions, medicineDataSourceOptions } = this.props;
		let title = '新建机构';
		if (id) {
			title = '编辑机构';
		}
		let footer = (
			<Row style={{textAlign:'center'}}>
				<Button type="primary" onClick={this.onSubmit.bind(this, true)}>确定</Button>
				<Button type="default" onClick={this.onSubmit.bind(this, false)}>取消</Button>
			</Row>
		);

		if (disabled) {
			title = '查看机构';
			footer = (
				<Row style={{textAlign:'center'}}>
					<Button type="primary" onClick={this.onSubmit.bind(this, false)}>关闭</Button>
				</Row>
			);
		}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        footer={footer}
			>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>名称:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}} disabled={disabled}
						       value={name} onChange={this.onChange.bind(this, 'name')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>代码:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}} disabled={disabled}
						       value={code} onChange={this.onChange.bind(this, 'code')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>证书:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}} disabled={disabled}
						       value={certificate} onChange={this.onChange.bind(this, 'certificate')}
						/>
					</Col>
				</Row>
		        {(!certificate) && (
		          <Row style={{marginBottom:6}}>
		            <Col span={6} style={{textAlign:'right'}}>
						<Button type="primary"  onClick={this.onGenerateCode.bind(this)}>生成证书</Button>
		            </Col>
			          <label span={16} offset={1} onChange={this.onChange.bind(this,'genCode')}>{genCode}</label>
		          </Row>
				)}
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>疾病数据源:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}} disabled={disabled}
						        value={''+source_id}
						        placeholder="请选择数据源"
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'source_id')}
						>
							{diseaseDataSourceOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>检查数据源:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}} disabled={disabled}
						        value={''+exam_source_id}
						        placeholder="请选择数据源"
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'exam_source_id')}
						>
							{examDataSourceOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>药品数据源:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}} disabled={disabled}
						        value={''+medicine_source_id}
						        placeholder="请选择数据源"
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'medicine_source_id')}
						>
							{medicineDataSourceOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Modal>
		);
	}
}
