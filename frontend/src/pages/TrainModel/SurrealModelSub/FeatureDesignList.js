import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Tooltip, message, Button, Tabs, Popconfirm } from 'antd';

import styles from '../TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ featureDesignList }) => ({
	featureDesignList
}))
export default class FeatureDesignList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			keyword: '',

			page: 1,
			pageSize: 10,
		};
	}

	componentDidMount() {
		// const { dispatch } = this.props;
		// dispatch({
		// 	type: 'exam/init',
		// 	payload: this.buildListQueryParams()
		// });
	}

	buildListQueryParams() {
		const { page, pageSize, keyword } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
		};
		if (keyword) {
			params.keyword = keyword;
		}
		return params;
	}

	fetchListData() {
		alert('TODO fetch later!')
		// const { dispatch } = this.props;
		// dispatch({
		// 	type: 'trainTaskList/fetch',
		// 	payload: this.buildListQueryParams(),
		// });
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	onKeywordChange(e) {
		this.setState({
			keyword: e.target.value
		});
	}

	onKeywordSearch(value) {
		this.setState({
			keyword: value,
			page: 1,
		}, this.fetchListData.bind(this));
	}

	editItem(record) {
		const { dispatch } = this.props;
		let webPath = `/train-model/surreal-feature-design?id=${record.id}`;
		dispatch(routerRedux.push(webPath));
	}

	deleteItem(record) {
		alert('delete!');
		// const { dispatch } = this.props;
		// dispatch({
		// 	type: 'exam/delete',
		// 	payload: {
		// 		updateParams: {
		// 			id: record.id,
		// 		},
		// 		queryParams: this.buildListQueryParams(),
		// 	}
		// });
	}

	onShowNewPopup() {
		let x = {
			id: 0,
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	textRender(maxLength, text, record, index) {
		let component = text;
		if (text.length > maxLength) {
			let showText = text.substring(0, maxLength-2) + '...';
			component = (
				<Tooltip title={text}>
					{showText}
				</Tooltip>
			);
		}
		return component;
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editItem.bind(this, record)}
			      style={{marginLeft: 16}}>
					<Icon type="edit" theme="outlined"/>编辑
				</span>
		);
		let deleteOp = (
			<span className={styles.ListOpDisable} style={{marginLeft: 16}}>
				<Popconfirm title="确定删除"
				            onConfirm={this.deleteItem.bind(this, record)}
				            onCancel={null}
				>
					<Icon type="delete" theme="outlined"/>删除
				</Popconfirm>
			</span>
		);
		return (
			<div>
				{editOp}
				{deleteOp}
			</div>
		);
	}

	buildOpBar() {
		const { keyword } = this.state;
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					关键词: <Input.Search style={{ width:'70%'}} placeholder="input search text"
					                   onChange={this.onKeywordChange.bind(this)}
					                   onSearch={this.onKeywordSearch.bind(this)}
					                   value={keyword}
				/>
				</Col>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建特征设计</Button>
				</Col>
			</Row>
		);
	}

	render() {
		const { page, pageSize } = this.state;
		const { total, data } = this.props.featureDesignList;
		const columns = [
			{dataIndex:'name', title:'名称', render: this.textRender.bind(this, 16)},
			{dataIndex:'description', title:'描述', render: this.textRender.bind(this, 32)},
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
				<Table size="small"
				       columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
			</div>
		);
	}
}
