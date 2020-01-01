import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button,
	Popconfirm, Modal } from 'antd';

import styles from './Org.less';
let underscore = require('underscore');

@connect(({ feedback }) => ({
	feedback
}))
export default class FeedbackList extends React.Component {
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

	buildListQueryParams() {
		const { page, pageSize, keyword } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			keyword: keyword,
		};
		return params;
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'feedback/fetch',
			payload: this.buildListQueryParams()
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
			type: 'feedback/fetch',
			payload: this.buildListQueryParams()
		});
	}

	showPopup(record) {
		this.setState({
			showPopup: true,
			hotOne: record,
		});
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.showPopup.bind(this, record)}
			      style={{marginLeft: 16}}>
				<Icon type="edit" theme="outlined"/>查看
			</span>
		);
		return (
			<div>
				{editOp}
			</div>
		);
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

	buildOpBar() {
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					关键词: <Input.Search style={{ width:'70%'}} placeholder="input search text"
					                   onChange={this.onKeywordChange.bind(this)}
					                   onSearch={this.onKeywordSearch.bind(this)}
				/>
				</Col>
			</Row>
		);
	}

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState);
	}

	onSubmit(isUpdate) {
		this.setState({
			showPopup: false,
		});
	}

	render() {
		const { data, total } = this.props.feedback;
		const { page, pageSize, showPopup, hotOne } = this.state;
		const columns = [
			{dataIndex:'created_at', title:'提交时间'},
			{dataIndex:'org_name', title:'机构'},
			{dataIndex:'operator', title:'反馈者代码'},
			{dataIndex:'operator_name', title:'反馈者姓名'},
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
				<FeedbackPopup visible={showPopup}
				                 item={hotOne}
				                 onSubmit={this.onSubmit.bind(this)}
				/>
			</div>
		);
	}
}

class FeedbackPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillReceiveProps(nextProps) {
		// let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		// if (isSame) {
		// 	return;
		// }
		// let newState = this.initData(nextProps.item);
		// this.setState(newState);
	}

	onSubmit(isUpdate) {
		if (!this.props.onSubmit) {
			return;
		}
		this.props.onSubmit(isUpdate);
	}

	render() {
		const { item, visible } = this.props;
		let footer = (
			<Row style={{textAlign:'center'}}>
				<Button type="primary" onClick={this.onSubmit.bind(this, true)}>确定</Button>
			</Row>
		);
		return (
			<Modal  title="反馈信息" visible={visible} closable={false}
			        footer={footer}
			>
				<Input.TextArea disabled={true} autosize={true} value={item.content} />
			</Modal>
		);
	}
}