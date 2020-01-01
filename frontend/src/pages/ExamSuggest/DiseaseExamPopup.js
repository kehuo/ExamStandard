import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');
import debounce from 'lodash/debounce';

import styles from "./Exam.less";

export default class DiseaseExamPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
		this.onExamSearch = debounce(this.onExamSearch, 500);
	}

	initData(item) {
		let newState = {
			id: 0,
			owner_type: '',
			owner_id: '',
			disease_id: '',
			exam_id: '',
			exam_options: [],
			hit: '0.5',
			priority: '100',

		};
		// all from list panel
		newState.id = item.id;
		newState.owner_type = item.owner_type;
		newState.owner_id = ''+item.owner_id;
		newState.disease_id = ''+item.disease_id;

		if (item && item.id) {
			newState.exam_id = item.exam_id;
			newState.exam_options = [{name:item.exam_name, id:''+item.exam_id}];

			newState.hit = ''+item.hit;
			newState.priority = ''+item.priority;
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
		const { id, owner_type, owner_id, disease_id, exam_id, hit, priority } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!exam_id || !hit) {
			message.error('请检查检查、次序等信息是否选择或填写!');
			return;
		}
		let x = {
			id: id,
			owner_type: owner_type,
			owner_id: parseInt(owner_id),
			disease_id: parseInt(disease_id),
			exam_id: parseInt(exam_id),
			hit: parseFloat(hit),
			priority: parseInt(priority)
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['hit','priority'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	onExamSearch(keyword) {
		if (this.props.onExamSearch) {
			this.props.onExamSearch(keyword, function(data) {
				this.setState({exam_options: data});
			}.bind(this));
		}
	}

	render() {
		const {id, exam_id, exam_options, hit, priority } = this.state;
		const { visible } = this.props;
		let title = '新建疾病-检查关联';
		if (id) {
			title = '编辑疾病-检查关联';
		}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>检查项目:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}}
						        showSearch
						        value={''+exam_id}
						        placeholder="请选择检查项目"
						        defaultActiveFirstOption={false}
						        showArrow={false}
						        filterOption={false}
						        onSearch={this.onExamSearch.bind(this)}
						        onChange={this.onChange.bind(this, 'exam_id')}
						        notFoundContent={null}
						>
							{exam_options.map( o=> <Select.Option key={''+o.id}>{o.name}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>显示顺序:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={priority} onChange={this.onChange.bind(this, 'priority')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>占比:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={hit} onChange={this.onChange.bind(this, 'hit')}
						/>
					</Col>
				</Row>
			</Modal>
		);
	}
}
