import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Popconfirm, message, Button, Modal, Tooltip } from 'antd';
import {routerRedux} from 'dva/router';
import { stringify } from 'qs';
import { buildConditionDisplay } from '../Common/Utils';
import styles from './Template.less';
let underscore = require('underscore');
let Immutable = require('immutable');

@connect(({ vdPackageList }) => ({
	vdPackageList,
}))
export default class VDPackageList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',
		};
	}

	buildListQueryParams() {
		const { page, pageSize, keyword } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			keyword: keyword,
		};
		if (!keyword) {
			delete params.keyword;
		}
		return params;
	}

	componentDidMount() {
		let query = this.props.location.query;
		let queryState = {
			page: 1,
			pageSize: 10,
		};
		for (let k in query) {
			let val = query[k];
			if (['page', 'pageSize', 'keyword'].indexOf(k) == -1) {
				continue;
			}
			if (k == 'page' || k == 'pageSize') {
				val = parseInt(val);
			}
			queryState[k] = val;
		}
		this.setState(queryState, this.fetchInit.bind(this));
	}

	fetchInit() {
		const { dispatch } = this.props;
		dispatch({
			type: 'vdPackageList/fetch',
			payload: this.buildListQueryParams(),
		});
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
			type: 'vdPackageList/fetch',
			payload: this.buildListQueryParams()
		});
	}

	deleteTemplate(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'vdPackageList/delete',
			payload: {
				updateParams: {
					id: record.id,
				},
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	editTemplate(record) {
		let id = 0;
		if (record) {
			id = record.id;
		}
		let webPath = `/template/vd-package-editor?id=${id}`;
		this.props.dispatch(routerRedux.push(webPath));
	}

	opRender(text, record, index) {
		let statusOp = (
			<span className={styles.ListOpDelete} style={{marginLeft: 16}}>
				<Popconfirm title="确定删除"
				            onConfirm={this.deleteTemplate.bind(this, record)}
				            onCancel={null}
				>
					<Icon type="delete" theme="outlined"/>删除
				</Popconfirm>
			</span>
		);
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editTemplate.bind(this, record)}
			      style={{marginLeft: 16}}>
					<Icon type="edit" theme="outlined"/>编辑
				</span>
		);
		return (
			<div>
				{statusOp}
				{editOp}
			</div>
		);
	}

	nameRender(text, record, index) {
		let displayText = text;
		let component = displayText;
		if (displayText>16) {
			displayText = displayText.substring(0, 13) + '...';
			component = (
				<Tooltip title={text}>
					{displayText}
				</Tooltip>
			);
		}
		return component;
	}

	onKeywordChange(e) {
		this.setState({
			keyword: e.target.value
		});
	}

	onKeywordSearch(value) {
		this.setState({
			keyword: value,
			page: 1
		}, this.fetchListData.bind(this));
	}

	buildOpBar() {
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={3} offset={1}>
					<Button type="primary" onClick={this.editTemplate.bind(this, null)}>新建模板</Button>
				</Col>
			</Row>
		);
	}

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState);
	}

	render() {
		const { data, total } = this.props.vdPackageList;
		const { page, pageSize } = this.state;
		const columns = [
			{dataIndex:'id', title:'序号'},
			{dataIndex:'source_name', title:'数据源', render: this.nameRender.bind(this)},
			{dataIndex:'virtual_department_name', title:'虚拟组', render: this.nameRender.bind(this)},
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
				{this.buildOpBar()}
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
			</div>
		);
	}
}
