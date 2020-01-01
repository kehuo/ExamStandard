import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm } from 'antd';
import DemoNewTaskPopup from './DemoNewTaskPopup';

import styles from './TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ trainTaskList }) => ({
	trainTaskList
}))
export default class DemoTaskList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',

			showPopup: false,
			hotOne: {},
		};
	}

	componentDidMount() {
		this.fetchListData();
	}

	buildListQueryParams() {
		const { page, pageSize } = this.state;
		return {
			page: page,
			pageSize: pageSize,
		};
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'trainTaskList/fetch',
			payload: this.buildListQueryParams(),
		});
	}

	onShowNewPopup() {
		let x = {
			taskId: 0,
			name: '',
			description: '',
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	buildOpBar() {
		const { keyword } = this.state;
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建任务</Button>
				</Col>
			</Row>
		);
	}

	editTaskInfo(record) {
		this.setState({
			showPopup: true,
			hotOne: record,
		});
	}

	onSubmit(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.realEditTask.bind(this, record);
		}
		this.setState({
			showPopup: false,
			hotOne: record,
		}, callback);
	}

	realEditTask(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'trainTaskList/edit',
			payload: {
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	gotoTaskDetail(record) {
		let id = record.taskId;
		let webPath = `/train-model/task-detail?id=${id}`;
		this.props.dispatch(routerRedux.push(webPath));
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	statusRender(text, record, index) {
		const StatusMap = {
			'PENDING': '准备中',
			'STOP': '中断',
			'FINISHED': '结束',
			'RUNNING': '运行中'
		};
		return StatusMap[text];
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editTaskInfo.bind(this, record)}
			      style={{marginLeft: 16}}>
					<Icon type="edit" theme="outlined"/>编辑
				</span>
		);
		let enterOp = (
			<span className={styles.ListOpEnable} style={{marginLeft: 16}}
			      onClick={this.gotoTaskDetail.bind(this, record)} >
				<Icon type="eye" theme="outlined"/>查看
			</span>
		);
		return (
			<div>
				{editOp}
				{enterOp}
			</div>
		);
	}

	render() {
		const { data, total } = this.props.trainTaskList;
		const { page, pageSize, showPopup, hotOne } = this.state;
		const columns = [
			{dataIndex:'name', title:'名称'},
			{dataIndex:'description', title:'描述', width:'40%'},
			{dataIndex:'createdAt', title:'创建时间'},
			{dataIndex:'status', title:'状态', render: this.statusRender.bind(this)},
			{dataIndex:'taskId', title:'操作', render: this.opRender.bind(this)},
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
			<div style={{width:1000, margin:'auto', backgroundColor:'white', padding:20}}>
				{this.buildOpBar()}
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
				<DemoNewTaskPopup visible={showPopup}
				            item={hotOne}
				            onSubmit={this.onSubmit.bind(this)}
				/>
			</div>
		);
	}
}
