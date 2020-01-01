import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./ThirdParty.less";

export default class HeredopathiaHpoPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			phenotype: '',
			mim_phenotype_id: '',
			symbols: '',
			phenotype_cn: '',
			hpo: '',
			symbols_introduction: '',
			phenotype_introduction: '',
			symptom: '',
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.phenotype = item.phenotype;
			newState.mim_phenotype_id = item.mim_phenotype_id;
			newState.symbols = item.symbols;
			newState.phenotype_cn = item.phenotype_cn;
			newState.hpo = item.hpo;
			newState.symbols_introduction = item.symbols_introduction;
			newState.phenotype_introduction = item.phenotype_introduction;
			newState.symptom = item.symptom;
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
		const { id, phenotype, mim_phenotype_id, symbols, phenotype_cn, hpo,
			symbols_introduction, phenotype_introduction, symptom } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!phenotype || !mim_phenotype_id || !symbols || !hpo) {
			message.error('请检查相关信息是否选择或填写!');
			return;
		}
		let x = {
			id: id,
			phenotype: phenotype,
			mim_phenotype_id: mim_phenotype_id,
			symbols: symbols,
			phenotype_cn: phenotype_cn,
			hpo: hpo,
			symbols_introduction: symbols_introduction,
			phenotype_introduction: phenotype_introduction,
			symptom: symptom,
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['phenotype','mim_phenotype_id','symbols','phenotype_cn','hpo',
				'symbols_introduction','phenotype_introduction'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const {id, phenotype, mim_phenotype_id, symbols, phenotype_cn, hpo,
			symbols_introduction, phenotype_introduction, symptom } = this.state;
		const { visible } = this.props;
		let title = '新建遗传病项';
		if (id) {
			title = '编辑遗传病项';
		}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>表型:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={phenotype} onChange={this.onChange.bind(this, 'phenotype')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>mim表型id:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={mim_phenotype_id} onChange={this.onChange.bind(this, 'mim_phenotype_id')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>遗传病:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={symbols} onChange={this.onChange.bind(this, 'symbols')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>表型中文:</Col>
					<Col span={16} offset={1}>
						<Input.TextArea style={{width:'100%'}}
						                autosize={{ minRows: 3, maxRows: 3 }}
						       value={phenotype_cn} onChange={this.onChange.bind(this, 'phenotype_cn')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>相关HPO:</Col>
					<Col span={16} offset={1}>
						<Input.TextArea style={{width:'100%'}}
						                autosize={{ minRows: 3, maxRows: 3 }}
						       value={hpo} onChange={this.onChange.bind(this, 'hpo')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>遗传病介绍:</Col>
					<Col span={16} offset={1}>
						<Input.TextArea style={{width:'100%'}}
						                autosize={{ minRows: 3, maxRows: 3 }}
						       value={symbols_introduction} onChange={this.onChange.bind(this, 'symbols_introduction')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>表型介绍:</Col>
					<Col span={16} offset={1}>
						<Input.TextArea style={{width:'100%'}}
						                autosize={{ minRows: 3, maxRows: 3 }}
						       value={phenotype_introduction}
						                onChange={this.onChange.bind(this, 'phenotype_introduction')}
						/>
					</Col>
				</Row>
			</Modal>
		);
	}
}
