import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Checkbox, Icon, Table, Popconfirm, message, Button, Tabs,
	Tooltip, Modal, Card } from 'antd';
import ElementComponent from '../Template/ElementComponent';

import styles from './ExamStandard.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ loincList }) => ({
	loincList
}))
export default class LoincList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			keyword: '',
			page: 1,
			pageSize: 10,

			showPopup: false,
			hotItem: null,
		};
	}

	componentDidMount() {
		this.fetchListData();
	}

	buildListQueryParams() {
		const {page, pageSize, keyword} = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			keyword: keyword,
		};
		return params;
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'loincList/fetch',
			payload: this.buildListQueryParams(),

			// 若添加 callback, 会有翻页问题, 暂时注释
			// callback: this.setPage1.bind(this)
		});
	}

	setPage1() {
		this.setState({
			page: 1,
		});
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	showPopup(record) {
		this.setState({
			showPopup: true,
			hotItem: record,
		});
	}

	onClosePopup(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.updateRecord.bind(this, record);
		}
		this.setState({
			showPopup: false,
		}, callback);
	}

	updateRecord(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'loincList/edit',
			payload: {
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.setPage1.bind(this)
		});
	}

	idRender(content, record, index) {
		let component = (
			<span style={{textDecoration:'underline', cursor:'pointer'}}
			      onClick={this.showPopup.bind(this, record)}>{content}</span>
		);
		return component;
	}

	textRender(maxLength, content, record, index) {
		let component = content;
		if (content.length > maxLength) {
			let showText = content.substring(0, maxLength-3) + '...';
			component = (
				<Tooltip title={content}>
					{showText}
				</Tooltip>
			);
		}
		return component;
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (['checkbox'].indexOf(elementType) != -1) {
			realVal = val.target.checked;
		}
		curState[tag] = realVal;

		let callback = null;
		this.setState(curState, callback);
	}

	buildOpBar() {
		const { keyword } = this.state;
		let extra = (
			<Button type="primary" onClick={this.fetchListData.bind(this)}>搜索</Button>
		);
		return (
			<Card title="查询条件" size="small" extra={extra}>
				<Row style={{marginTop:10, marginBottom:10}} gutter={8}>
					<Col span={8}>
						关键词: <Input style={{width:'70%'}}
						            value={keyword}
						            onChange={this.onChangeElement.bind(this, 'input', 'keyword')}
						/>
					</Col>
				</Row>
			</Card>
		);
	}

	render() {
		const { total, data } = this.props.loincList;
		const { page, pageSize, showPopup, hotItem } = this.state;
		const columns = [
			{dataIndex:'loinc_number', title:'编码', render: this.idRender.bind(this)},
			{dataIndex:'class_x', title:'分类', render: this.textRender.bind(this, 10)},
			{dataIndex:'system', title:'系统', render: this.textRender.bind(this, 10)},
			{dataIndex:'component', title:'部位', render: this.textRender.bind(this, 10)},
			{dataIndex:'method_typ', title:'方法', render: this.textRender.bind(this, 20)},
			{dataIndex:'scale_typ', title:'结果类型'},
			{dataIndex:'property', title:'属性'},
			{dataIndex:'time_aspect', title:'时间信息'},
		];
		let pageOpts = {
			current: page,
			pageSize: pageSize,
			size: 'small',
			total: total,
			onChange: this.onListPageChange.bind(this),
			onShowSizeChange: this.onListPageChange.bind(this)
		};
		return (
			<div style={{minWidth:1000, backgroundColor:'white', padding:20}}>
				{this.buildOpBar()}
				<Table size="small"
				       columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
				<LoincPopup visible={showPopup}
				            item={hotItem}
				            onSubmit={this.onClosePopup.bind(this)}
				/>
			</div>
		);
	}
}

class LoincPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props);
	}

	initData(props) {
		let newState = {};
		if (props.item) {
			newState = JSON.parse(JSON.stringify(props.item));
		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps);
		this.setState(newState);
	}

	onSubmit(isUpdate) {
		const { component, time_aspect, class_x, system, method_typ,
			scale_typ, property } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!component || !time_aspect || !class_x || !system || !method_typ
			|| !scale_typ || !property ) {
			message.error('请检查信息是填写!');
			return;
		}

		let x = JSON.parse(JSON.stringify(this.state));
		this.props.onSubmit(true, x);
	}

	render() {
		const Lines = [
			{
				split: 12,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'编码', tag:'loinc_number'
				}, {
					layout: {title:6, element:16}, elementType:'input',
					title:'时间信息', tag:'time_aspect'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:21}, elementType:'input',
					title:'分类', tag:'class_x'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:21}, elementType:'input',
					title:'系统', tag:'system'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:21}, elementType:'input',
					title:'部位', tag:'component'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:21}, elementType:'input',
					title:'方法', tag:'method_typ'
				}]
			},
			{
				split: 12,
				items: [{
					layout: {title:6, element:16}, elementType:'input',
					title:'结果类型', tag:'scale_typ'
				}, {
					layout: {title:6, element:16}, elementType:'input',
					title:'属性', tag:'property'
				}]
			},
		];
		const { visible } = this.props;
		let title = '编辑Loinc';
		return (
			<Modal  title={title} visible={visible}
			        width={800} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				{Lines.map(this.renderLine.bind(this))}
			</Modal>
		);
	}
}