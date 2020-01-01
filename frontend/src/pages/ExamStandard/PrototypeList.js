import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Checkbox, Icon, Table, Popconfirm, message, Button, Tabs,
	Tooltip, DatePicker, Card } from 'antd';

import styles from './ExamStandard.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ prototypeList }) => ({
	prototypeList
}))
export default class PrototypeList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			demoType: '肾病理报告',
			page: 1,
			pageSize: 10,
		};
	}

	componentDidMount() {
		this.fetchListData();
	}

	buildListQueryParams() {
		const {page, pageSize, demoType} = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			demoType: demoType,
		};
		return params;
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'prototypeList/fetch',
			payload: this.buildListQueryParams(),
		});
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	goCaseOnePanel(record) {
		let webPath = `/exam-standard/prototype-one?id=${record.uuid}`;
		this.props.dispatch(routerRedux.push(webPath));
	}

	idRender(content, record, index) {
		let component = (
			<span style={{textDecoration:'underline', cursor:'pointer'}}
			      onClick={this.goCaseOnePanel.bind(this, record)}>{content}</span>
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
		const { demoType } = this.state;
		const typeOpts = [{k:'肾病理报告', v:'肾病理报告'},{k:'肝病理报告', v:'肝病理报告'}];
		let extra = (
			<Button type="primary" onClick={this.fetchListData.bind(this)}>搜索</Button>
		);
		return (
			<Card title="查询条件" size="small" extra={extra}>
				<Row style={{marginTop:10, marginBottom:10}} gutter={8}>
					<Col span={8}>
						内容分类: <Select style={{width:'80%'}}
						            allowClear
						            value={demoType}
						            defaultActiveFirstOption={false}
						            showArrow={true}
						            filterOption={false}
						            onChange={this.onChangeElement.bind(this, 'select', 'demoType')}
						>
							{typeOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Card>
		);
	}

	render() {
		const { total, data } = this.props.prototypeList;
		const { page, pageSize } = this.state;
		const columns = [
			{dataIndex:'uuid', title:'ID', render: this.idRender.bind(this)},
			{dataIndex:'type', title:'内容分类'},
			{dataIndex:'diagnosis', title:'诊断摘要', render: this.textRender.bind(this, 20)},
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
			</div>
		);
	}
}
