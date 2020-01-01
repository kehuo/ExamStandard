import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Common.less";

export default class DiseasePopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			code: '',
			name: '',
			pinyin_abbr: '',
			wubi_abbr: '',
			system_id: '',
			source_id: '',
			icd_class: '',
			symptom_flag: '',
			status: false,
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.code = item.code;
			newState.name = item.name;
			newState.pinyin_abbr = item.pinyin_abbr;
			newState.wubi_abbr = item.wubi_abbr;
			newState.system_id = ''+item.system_id;
			newState.source_id = ''+item.source_id;
			newState.icd_class = item.icd_class;
			newState.status = (item.status == 1);
			newState.symptom_flag = ''+item.symptom_flag;
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
		const { id, name, code, pinyin_abbr, wubi_abbr, system_id, source_id, icd_class,
			symptom_flag, status } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!name || !code || !system_id || !source_id || !icd_class || !symptom_flag) {
			message.error('请检查名称、代码、疾病系统、数据源等信息是否选择或填写!');
			return;
		}
		let x = {
			id: id,
			name: name,
			code: code,
			pinyin_abbr: pinyin_abbr,
			wubi_abbr: wubi_abbr,
			system_id: parseInt(system_id),
			source_id: parseInt(source_id),
			icd_class: icd_class,
            symptom_flag: parseInt(symptom_flag),
			status: status ? 1 : 0,
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['name','code','pinyin_abbr','wubi_abbr','icd_class','symptom_flag'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else if (['status'].indexOf(tag) != -1) {
			curState[tag] = val.target.checked;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const { id, name, code, pinyin_abbr, wubi_abbr, system_id, source_id, icd_class,
			symptom_flag, status } = this.state;
		const { visible, diseaseSystemOptions, dataSourceOptions } = this.props;
		let title = '新建疾病';
		if (id) {
			title = '编辑疾病';
		}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>名称:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={name} onChange={this.onChange.bind(this, 'name')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>代码:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={code} onChange={this.onChange.bind(this, 'code')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Checkbox
						checked={status}
						onChange={this.onChange.bind(this, 'status')}>
						{'启用'}
					</Checkbox>
				</Row>

		        <Row style={{marginBottom:6}}>
		          <Col span={6} style={{textAlign:'right'}}>icd类别代码:</Col>
		          <Col span={16} offset={1}>
		            <Input style={{width:'100%'}}
		                   value={icd_class} onChange={this.onChange.bind(this, 'icd_class')}
		            />
		          </Col>
		        </Row>
		        <Row style={{marginBottom:6}}>
		          <Col span={6} style={{textAlign:'right'}}>症状标签:</Col>
		          <Col span={16} offset={1}>
		            <Input style={{width:'100%'}}
		                   value={symptom_flag} onChange={this.onChange.bind(this, 'symptom_flag')}
		            />
		          </Col>
		        </Row>

				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>拼音缩写:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={pinyin_abbr} onChange={this.onChange.bind(this, 'pinyin_abbr')}
						/>
					</Col>
				</Row>

				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>五笔缩写:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={wubi_abbr} onChange={this.onChange.bind(this, 'wubi_abbr')}
						/>
					</Col>
				</Row>

				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>疾病系统:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}}
						        value={''+system_id}
						        placeholder="请选择疾病系统"
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'system_id')}
						>
							{diseaseSystemOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>

				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>数据源:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}}
						        value={''+source_id}
						        placeholder="请选择数据源"
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'source_id')}
						>
							{dataSourceOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Modal>
		);
	}
}
