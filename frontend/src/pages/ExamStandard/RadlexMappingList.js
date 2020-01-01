import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Checkbox, Icon, Table, Popconfirm, message, Button, Tabs,
	Tooltip, Modal, Card } from 'antd';
import ElementComponent from '../Template/ElementComponent';
import styles from './ExamStandard.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';
import debounce from 'lodash/debounce';

@connect(({ radlexMappingList }) => ({
	radlexMappingList
}))
export default class RadlexMappingList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			keyword: '',
			page: 1,
			pageSize: 10,

			showPopup: false,
			hotItem: null,
			radlexOpts: [],
		};
		this.queryRadlexItem = debounce(this.queryRadlexItem, 500);
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
			type: 'radlexMappingList/fetch',
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
		let radlexOpts = [];
		if (record.dst) {
			let x = JSON.parse(record.dst);
			let y = x.cn_name + ':' + x.rid;
			radlexOpts = [{k:y, v:y}];
		}
		this.setState({
			showPopup: true,
			hotItem: record,
			radlexOpts: radlexOpts
		});
	}

	createNewOne() {
		let record = {
			id: 0,
		};
		this.editItemOne(record);
	}

	updateOpts(data) {
		let radlexOpts = [];
		for (let i=0; i<data.items.length; i++) {
			let curI = data.items[i];
			let name = curI.cn_name ? curI.cn_name : curI.en_name;
			let x = name + ':' + curI.rid;
			radlexOpts.push({
				k: x, v: x
			});
		}
		this.setState({
			radlexOpts: radlexOpts
		});
	}

	queryRadlexItem(keyword) {
		const { dispatch } = this.props;
		let callback = this.updateOpts.bind(this);
		dispatch({
			type: 'radlexMappingList/queryRadlex',
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
			type: 'radlexMappingList/edit',
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
			type: 'radlexMappingList/delete',
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
		const { total, data } = this.props.radlexMappingList;
		const { page, pageSize, showPopup, hotItem, radlexOpts } = this.state;
		const columns = [
			{dataIndex:'id', title:'ID'},
			{dataIndex:'tag_type', title:'源数据分类'},
			{dataIndex:'src', title:'源数据'},
			{dataIndex:'dst', title:'操作', render: this.opRender.bind(this)},
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
				<RadlexMappingPopup
					visible={showPopup}
				    item={hotItem}
					radlexOpts={radlexOpts}
				    onSubmit={this.closePopup.bind(this)}
				    onQuery={this.queryRadlexItem.bind(this)}
				/>
			</div>
		);
	}
}

class RadlexMappingPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props);
	}

	initData(props) {
		let newState = {
			src: '',
			dst: '',
			id: '',
			tag_type: '',
		};
		if (props.item) {
			let itemOne = props.item;
			newState.id = itemOne.id;
			newState.src = itemOne.src;
			newState.tag_type = itemOne.tag_type;

			if (itemOne.dst) {
				let x = JSON.parse(itemOne.dst);
				let y = x.cn_name + ':' + x.rid;
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
		const { id, src, dst, tag_type } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!src || !dst || !tag_type) {
			message.error('请检查信息是填写!');
			return;
		}

		let fields = dst.split(':');
		let dstA = JSON.stringify({
			cn_name: fields[0],
			rid: fields[1]
		});
		let x = {
			id: id,
			tag_type: tag_type,
			src: src,
			dst: dstA,
		};
		this.props.onSubmit(true, x);
	}

	render() {
		const { visible, item, onQuery, radlexOpts } = this.props;
		const TagOpts = [
			{k:'症状', v:'symptom'},{k:'方位', v:'symptom_pos'},{k:'解剖/生理', v:'symptom_obj'},
			{k:'局部部位/通用', v:'object_part'},{k:'病灶', v:'lesion'},{k:'病灶描述', v:'lesion_desc'},
			{k:'逆序检查结果', v:'reversed_exam_result'},{k:'逆序检查项', v:'reversed_exam_item'},
			{k:'检查项', v:'exam_item'},{k:'检查', v:'exam'},{k:'检查结果', v:'exam_result'},
			{k:'临床表现', v:'symptom_desc'},{k:'症状特性/修饰', v:'symptom_deco'},
			{k:'疾病', v:'disease'},{k:'疾病修饰', v:'disease_desc'},
			{k:'药物', v:'medicine'},{k:'药物修饰', v:'medicine_desc'},
			{k:'治疗', v:'treatment'},{k:'治疗修饰', v:'treatment_desc'},
			{k:'否定', v:'entity_neg'},{k:'病史类型描述', v:'desc_type'},
			{k:'医疗事件', v:'medical_events'},{k:'时间', v:'time'},
			{k:'病因', v:'pathogen'},{k:'矢量段落', v:'vector_seg'},
		];
		const Lines = [
			{
				split: 24,
				items: [{
					layout: {title:2, element:21}, elementType:'selectSimple',
					title:'源数据类型', tag:'tag_type', options: TagOpts
				}]
			},
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
					title:'Radlex', tag:'dst', options: radlexOpts,
					searchFunc: onQuery
				}]
			},
		];
		let title = '编辑Radlex映射';
		if (item && !item.id) {
			title = '创建Radlex映射';
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