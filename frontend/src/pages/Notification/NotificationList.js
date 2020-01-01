import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm, Tooltip } from 'antd';

import styles from './Notification.less';
let underscore = require('underscore');

@connect(({ notification }) => ({
	notification
}))
export default class NotificationList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			status: 'WAIT',
		};
	}

	buildListQueryParams() {
		const { page, pageSize, status} = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			status: status
		};
		return params;
	}

	componentDidMount() {
		this.fetchListData();
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'notification/fetch',
			payload: this.buildListQueryParams()
		});
	}

	deleteDataSource(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'notification/delete',
			payload: {
				updateParams: {
					id: record.id,
				},
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	opRender(text, record, index) {
		let editOp = null;
		if (record.status == 'WAIT') {
			editOp = (
				<span className={styles.ListOpEdit} onClick={this.realEditDataSource.bind(this, record)}
				      style={{marginLeft: 16}}>
					<Icon type="edit" theme="outlined"/>阅读
				</span>
			);
		}
		let deleteOp = (
			<span className={styles.ListOpDelete} style={{marginLeft: 16}}>
				<Popconfirm title="确定删除"
				            onConfirm={this.deleteDataSource.bind(this, record)}
				            onCancel={null}
				>
					<Icon type="delete" theme="outlined"/>删除
				</Popconfirm>
			</span>
		);
		return (
			<div>
				{deleteOp}
				{editOp}
			</div>
		);
	}

	longTextRender(text, record, index) {
		if (!text) {
			return '未知';
		}
		if (text.length < 16) {
			return text;
		}
		let showText = text.substring(0, 8) + '...';
		let component = (
			<Tooltip title={text}>
				{showText}
			</Tooltip>
		);
		return component;
	}

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState);
	}

	realEditDataSource(record) {
		const { dispatch } = this.props;
		let x = JSON.parse(JSON.stringify(record));
		x.status = 'DONE';
		dispatch({
			type: 'notification/edit',
			payload: {
				updateParams: x,
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	render() {
		const { data, total } = this.props.notification;
		const { page, pageSize } = this.state;
		const columns = [
			{dataIndex:'message_type', title:'类型'},
			{dataIndex:'status', title:'状态'},
			{dataIndex:'content', title:'内容', render: this.longTextRender.bind(this)},
			{dataIndex:'id', title:'操作', render: this.opRender.bind(this)},
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
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
			</div>
		);
	}
}
