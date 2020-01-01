import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Checkbox, Icon, Table, Popconfirm, message, Button, Tabs,
	Tooltip, DatePicker, Card } from 'antd';
const { Search } = Input;

import styles from './ExamStandard.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';
let moment = require('moment');
import debounce from 'lodash/debounce';

@connect(({ showExamReportList }) => ({
	showExamReportList
}))
export default class ShowExamReportList extends React.Component {
	constructor(props) {
		super(props);
		let now = moment();
		this.state = {
			id: '',
			content: '',
			type: '',
			page: 1,
			pageSize: 10,
		};
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'showExamReportList/init',
			payload: this.buildListQueryParams(),
		});
	}

	buildListQueryParams() {
		// sortCol 和 sortOrder 是翻页时候用的
		const {page, pageSize, id, sortCol, sortOrder} = this.state;
		// const { page, pageSize, dateRange, orgCode, deptCode, patientId, visitId, sortCol, sortOrder } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
		};
		if (id) {
			params.id = id;
		if (sortCol) {
			params.sortCol = sortCol;
		}
		if (sortOrder) {
			params.sortOrder = sortOrder;
		}
		}
		return params;
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'showExamReportList/fetch',
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
		let webPath = `/exam-standard/show-exam-report-result-one?id=${record.id}`;
		this.props.dispatch(routerRedux.push(webPath));
	}

	idRender(maxLength, content, record, index) {
		let component = (
			<span style={{textDecoration:'underline', cursor:'pointer'}}
			      onClick={this.goCaseOnePanel.bind(this, record)}>{content}</span>
		);
		if (content.length > maxLength) {
			let showText = content.substring(0, maxLength-2) + '...';
			component = (
				<Tooltip title={content}>
					<span style={{textDecoration:'underline', cursor:'pointer'}}
					      onClick={this.goCaseOnePanel.bind(this, record)}>{showText}</span>
				</Tooltip>
			);
		}
		return component;
	}

	// 2019-11-22周五 新增函数 添加关键字搜索框调用的函数
	fetchBYKeyworld = (value) => {
		const { dispatch } = this.props;
		dispatch({
			type: 'showExamReportList/fetch',
			payload: {
				'keyword': value
			},
		});
	}

	textRender(maxLength, content, record, index) {
		let component = content;
		if (content.length > maxLength) {
			let showText = content.substring(0, maxLength-10) + '...';
			component = (
				<Tooltip title={content}>
					{showText}
				</Tooltip>
			);
		}
		return component;
	}

	handleTableChange(pagination, filters, sorter) {
		this.setState({
			sortCol: sorter.columnKey,
			sortOrder: sorter.order
		}, this.fetchListData.bind(this));
	}

	render() {
		const { total, data } = this.props.showExamReportList;
		const { page, pageSize } = this.state;
		const columns = [
			// {dataIndex:'id', title:'ID', render: this.idRender.bind(this, 32)},
			{dataIndex:'type', title:'类型', render: this.idRender.bind(this, 32)},
			{dataIndex:'content', title:'检查报告文本', render: this.idRender.bind(this, 50), sorter: true},
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
				<Search placeholder="输入关键词" onSearch={value => this.fetchBYKeyworld(value)} enterButton />
				<Table size="small"
				       columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				       onChange={::this.handleTableChange}
				/>
			</div>
		);
	}
}
