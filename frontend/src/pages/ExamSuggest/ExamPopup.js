import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "../Common/Common.less";

const EmergencyOptions = [
	{k:'是',v:'1'}, {k:'否',v:'0'}
];

export default class ExamPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			name: '',
			code: '',
			exam_class: '',
			exam_type: '',
			project_type: '',
			source_id: '',
			unit: '',
			pinyin_abbr: '',
			wubi_abbr: '',
			emergency: '0',
			valid_flag: true
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.name = item.name;
			newState.code = item.code;
			newState.exam_class = item.exam_class;
			newState.exam_type = ''+item.exam_type;
			newState.project_type = item.project_type;
			newState.source_id = ''+item.source_id;
			newState.unit = item.unit;
			newState.pinyin_abbr = item.pinyin_abbr;
			newState.wubi_abbr = item.wubi_abbr;
			newState.emergency = ''+item.emergency;
			newState.valid_flag = item.valid_flag
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
		const { id, name, code, exam_class, exam_type, project_type, source_id, unit,
			pinyin_abbr, wubi_abbr, emergency, valid_flag } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!name || !code || !exam_type || !source_id ) {
			message.error('请检查名称、代码、类型和数据源等信息是否选择或填写!');
			return;
		}
		let x = {
			id: id,
			name: name,
			code: code,
			exam_class: exam_class,
			exam_type: parseInt(exam_type),
			project_type: project_type,
			unit: unit,
			pinyin_abbr: pinyin_abbr,
			wubi_abbr: wubi_abbr,
			source_id: parseInt(source_id),
			emergency: parseInt(emergency),
			valid_flag: valid_flag
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		console.log('test')
		console.log(tag, val)
		let curState = this.state;
		if (['code','name','exam_class','project_type','unit','pinyin_abbr','wubi_abbr'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else if (tag === 'valid_flag') {
			curState[tag] = val.target.checked;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const { id, name, code, exam_class, exam_type, project_type, source_id, unit,
			pinyin_abbr, wubi_abbr, emergency, valid_flag } = this.state;
		const { visible, dataSourceOptions, ExamTypeOptions } = this.props;
		let title = '新建检查';
		if (id) {
			title = '编辑检查';
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
					<Col span={6} style={{textAlign:'right'}}>类型:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}}
						        value={''+exam_type}
						        placeholder="请选择疾病系统"
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'exam_type')}
						>
							{ExamTypeOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>急诊专用:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}}
						        value={''+emergency}
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'emergency')}
						>
							{EmergencyOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>


				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>分类:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={exam_class} onChange={this.onChange.bind(this, 'exam_class')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>项目类型:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={project_type} onChange={this.onChange.bind(this, 'project_type')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>单位:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={unit} onChange={this.onChange.bind(this, 'unit')}
						/>
					</Col>
				</Row>

				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>拼音:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={pinyin_abbr} onChange={this.onChange.bind(this, 'pinyin_abbr')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>五笔:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={wubi_abbr} onChange={this.onChange.bind(this, 'wubi_abbr')}
						/>
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
						        onChange={this.onChange.bind(this, 'source_id')}>
							{dataSourceOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>

				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>状态:</Col>
					<Col span={16} offset={1}>
						<Checkbox style={{marginLeft:6}}
						          checked={valid_flag}
						          onChange={this.onChange.bind(this, 'valid_flag')}>
						</Checkbox>
					</Col>

				</Row>
			</Modal>
		);
	}
}
