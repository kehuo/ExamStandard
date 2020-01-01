import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Checkbox, Icon, Table, Popconfirm, message, Button, Tabs,
	Tooltip, Modal, Card } from 'antd';
import ElementComponent from '../Template/ElementComponent';
import styles from './ExamStandard.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';
import debounce from 'lodash/debounce';

@connect(({ loincStep0MappingList }) => ({
	loincStep0MappingList
}))
export default class LoincStep0MappingList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			keyword: '',
			page: 1,
			pageSize: 10,

			showPopup: false,
			hotItem: null,
			loincOpts: [],
			detailAll: [],
		};
		this.queryLoincItem = debounce(this.queryLoincItem, 500);
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
			type: 'loincStep0MappingList/fetch',
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
		let loincOpts = [];
		let detailAll = [];
		if (record.dst) {
			let x = JSON.parse(record.dst);
			let y = [x.loinc_number, x.class_x, x.system, x.component].join(':');
			loincOpts = [{k:y, v:y}];
			detailAll.push(x);
		}
		this.setState({
			showPopup: true,
			hotItem: record,
			loincOpts: loincOpts,
			detailAll: detailAll
		});
	}

	createNewOne() {
		let record = {
			id: 0,
		};
		this.editItemOne(record);
	}

	updateOpts(data) {
		let loincOpts = [];
		let detailAll = [];
		for (let i=0; i<data.items.length; i++) {
			let x = data.items[i];
			let y = [x.loinc_number, x.class_x, x.system, x.component].join(':');;
			loincOpts.push({
				k: y, v: y
			});
		}
		detailAll = data.items;
		this.setState({
			loincOpts: loincOpts,
			detailAll: detailAll
		});
	}

	queryLoincItem(keyword) {
		const { dispatch } = this.props;
		let callback = this.updateOpts.bind(this);
		dispatch({
			type: 'loincStep0MappingList/queryLoinc',
			payload: {
				keyword: keyword,
				page: 1,
				pageSize: 1000
			},
			callback: callback
		});
	}

	realUpdateOne(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'loincStep0MappingList/edit',
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
			type: 'loincStep0MappingList/delete',
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

	dstRender(text, record, index) {
		let comp = null;
		if (!text) {
			return comp
		}
		let xObj = JSON.parse(text);
		comp = xObj.loinc_number;
		return comp;
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
		const { total, data } = this.props.loincStep0MappingList;
		const { page, pageSize, showPopup, hotItem, loincOpts, detailAll } = this.state;
		const columns = [
			{dataIndex:'src', title:'源数据'},
			{dataIndex:'dst', title:'目标', render: this.dstRender.bind(this)},
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
				<LoincStep0MappingPopup
					visible={showPopup}
				    item={hotItem}
					loincOpts={loincOpts}
					detailAll={detailAll}
				    onSubmit={this.closePopup.bind(this)}
				    onQuery={this.queryLoincItem.bind(this)}
				/>
			</div>
		);
	}
}

class LoincStep0MappingPopup extends ElementComponent {
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
			if (itemOne.dst) {
				let x = JSON.parse(itemOne.dst);
				let y = [x.loinc_number, x.class_x, x.system, x.component].join(':');
				newState.dst = y;
			}
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
		const { detailAll } = this.props;
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

		let fields = dst.split(':');
		let loinc_number = fields[0];
		let tgt = getDisplayTarget(loinc_number, detailAll);
		let x = {
			id: id,
			src: src,
			dst: JSON.stringify(tgt),
		};
		this.props.onSubmit(true, x);
	}

	buildItemOne(itemOne, tag, index, arrayX) {
		return (
			<Row style={{marginBottom:6}}>
				<Col span={6} style={{textAlign:'right'}}>{tag}:</Col>
				<Col span={16} style={{marginLeft:6}}>
					<span>{itemOne[tag]}</span>
				</Col>
			</Row>
		);
	}

	buildTargetDetail() {
		const { detailAll } = this.props;
		const { dst } = this.state;

		let fields = dst.split(':');
		let loinc_number = fields[0];
		let tgt = getDisplayTarget(loinc_number, detailAll);
		if (!tgt) {
			return null;
		}
		const TagsDisplay = ['loinc_number', 'class_x', 'component',
			'system', 'property', 'scale_typ', 'method_typ', 'time_aspect'];
		return (
			<Card size="small">
				{TagsDisplay.map(this.buildItemOne.bind(this, tgt))}
			</Card>
		)
	}

	render() {
		const { visible, item, onQuery, loincOpts } = this.props;
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
					layout: {title:2, element:21}, elementType:'selectRemote',
					title:'目标', tag:'dst', options: loincOpts,
					searchFunc: onQuery
				}]
			}
		];
		let title = '编辑LoincStep0映射';
		if (item && !item.id) {
			title = '创建LoincStep0映射';
		}
		return (
			<Modal  title={title} visible={visible}
			        width={800} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				{Lines.map(this.renderLine.bind(this))}
				{this.buildTargetDetail()}
			</Modal>
		);
	}
}

function getDisplayTarget(loincNumber, detailAll) {
	let tgt = null;
	for (let i=0; i<detailAll.length; i++) {
		let curD = detailAll[i];
		if (curD.loinc_number == loincNumber) {
			tgt = curD;
			break;
		}
	}
	return tgt;
}
