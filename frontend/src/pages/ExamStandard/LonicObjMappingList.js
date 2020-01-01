import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Checkbox, Icon, Table, Popconfirm, message, Button, Tabs,
	Tooltip, Modal, Card } from 'antd';
import ElementComponent from '../Template/ElementComponent';
import styles from './ExamStandard.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';
import debounce from 'lodash/debounce';

@connect(({ loincObjMappingList }) => ({
	loincObjMappingList
}))
export default class LonicObjMappingList extends React.Component {
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
			type: 'loincObjMappingList/fetch',
			payload: this.buildListQueryParams(),
		});
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	editItemOne(record) {
		this.setState({
			showPopup: true,
			hotItem: record,
		});
	}

	createNewOne() {
		let record = {
			id: 0,
		};
		this.editItemOne(record);
	}

	realUpdateOne(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'loincObjMappingList/edit',
			payload: {
				queryParams: this.buildListQueryParams(),
				updateParams: record,
			}
		});
	}

	closePopup(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.realUpdateOne.bind(this, record);
		}
		this.setState({
			showPopup: false,
			hotItem: null,
		}, callback);
	}

	deleteItemOne(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'loincObjMappingList/delete',
			payload: {
				queryParams: this.buildListQueryParams(),
				updateParams: record,
			}
		});
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editItemOne.bind(this, record)}
			      style={{marginLeft: 16}}>
				<Icon type="edit" theme="outlined"/>编辑
			</span>
		);
		let deleteOp = (
			<span className={styles.ListOpDelete} style={{marginLeft: 16}}>
				<Popconfirm title="确定删除"
				            onConfirm={this.deleteItemOne.bind(this, record)}
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
			<div>
				<Button type="primary" onClick={this.fetchListData.bind(this)}>搜索</Button>
				<Button style={{marginLeft:8}} type="primary"
				        onClick={this.createNewOne.bind(this)}>创建</Button>
			</div>
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
		const { total, data } = this.props.loincObjMappingList;
		const { page, pageSize, showPopup, hotItem } = this.state;
		const columns = [
			{dataIndex:'src', title:'源数据'},
			{dataIndex:'dst', title:'目标'},
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
			<div style={{minWidth:1000, backgroundColor:'white', padding:20}}>
				{this.buildOpBar()}
				<Table size="small"
				       columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
				<LoincObjMappingPopup
					visible={showPopup}
					item={hotItem}
					onSubmit={this.closePopup.bind(this)}
				/>
			</div>
		);
	}
}

class LoincObjMappingPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props);
	}

	initData(props) {
		let newState = {
			src: '',
			dst: '',
			id: '',
		};
		if (props.item) {
			let itemOne = props.item;
			newState.id = itemOne.id;
			newState.src = itemOne.src;
			newState.dst = itemOne.dst;
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
		const { id, src, dst } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!src || !dst) {
			message.error('请检查信息是填写!');
			return;
		}

		let x = {
			id: id,
			src: src,
			dst: dst,
		};
		this.props.onSubmit(true, x);
	}

	render() {
		const { visible, item } = this.props;
		const Lines = [
			{
				split: 24,
				items: [{
					layout: {title:2, element:21}, elementType:'input',
					title:'源数据', tag:'src'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:21}, elementType:'input',
					title:'目标', tag:'dst'
				}]
			},
		];
		let title = '编辑LoincObj映射';
		if (item && !item.id) {
			title = '创建LoincObj映射';
		}
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