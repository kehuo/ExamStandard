import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, Popconfirm, Modal, TreeSelect, Card, Switch, Divider, Spin } from 'antd';
import { buildTreeData } from '../../../utils/utils'

import styles from '../MasterData.less';
let underscore = require('underscore');

let taskStatusDict = {
	'WAITING': '待处理',
	'DISCARD': '丢弃',
	'FINISHED': '完成',
	'TAGGING': '重新标注'
};

const taskStatusOpts = [
	{k: '待处理', v: 'WAITING'},
	{k: '丢弃',  v: 'DISCARD'},
	{k: '完成', v: 'FINISHED'},
	{k: '重新标注', v: 'TAGGING'},
	{k: '所有任务', v: 'ALL'}
];


class NormalTaskOnePanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			text: '',
			type: '',
			status: '',
			emrId: '',
			entity: {},
			vectors: [],
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.text = item.text;
			newState.type = item.type;
			newState.status = item.status;
			newState.emrId = item.emrId;
			newState.entity = item.entity;

		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.item==nextProps.item);
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps.item);
		this.setState(newState);
	}

	isValidateContent(vectors) {
		let errMsg = '';
		let splitVectors = [];
		for (let i=0;i<vectors.length;i++) {
			let vName = vectors[i]['vName'];
			let sourceId = vectors[i]['sourceId'];
			if (sourceId === '') {
				errMsg = '请输入标准矢量名称';
				break;
			}
			if (splitVectors.indexOf(vName) !== -1) {
				errMsg = '分拆矢量名称重复';
				break;
			}
			splitVectors.push(vName);
		}
		return errMsg;
	}

	onSubmit(isUpdate) {
		const { id, text, type, vectors } = this.state;
		if (!this.props.onSubmit) {
			return;
		}

		if (isUpdate === false) {
			this.props.onSubmit(false, null);
			return
		}

		if (vectors.length===0) {
			message.error('请设置映射的标准矢量');
			return;
		}

		let errMsg = this.isValidateContent(vectors);
		if (errMsg !== '') {
			message.error(errMsg);
			return;
		}

		let x = {
			id: id,
			text: text,
			type: type,
			normVectors: vectors
		};
		this.props.onSubmit(true, x);
	}

	buildListQueryParams(category, value, idx) {
		let params = {
			dataType: 'mapping',
			type: category,
			page: 1,
			pageSize: 2000,
			keyword: value,
			idx: idx,
		};
		return params;
	}

	updateVectorOpts(idx, data) {
		let items = data['items'];
		let curState = this.state;
		curState.vectors[idx].vectorOpts=items;
		this.setState(curState);
	}

	onChange(idx, tag, val, label) {
		let curState = this.state;
		if (tag === 'additionId') {
			if (val === '') {
				return
			}
			curState.vectors[idx][tag] = '';
			if (_.find(curState.vectors[idx]['additions'], { 'id': val})) {
				message.info('扩展属性已添加')
			} else {
				let item = {
					'id': val,
					'label': label[0]
				};
				curState.vectors[idx]['additions'].push(item);
			}
		} else if (['vName'].indexOf(tag) != -1) {
			curState.vectors[idx][tag] = val.target.value;
		} else if (tag == 'type') {
			curState[tag] = val;
		} else {
			curState.vectors[idx][tag] = val;
		}
		this.setState(curState);
	}

	deleteVector(idx) {
		let curState = this.state;
		curState.vectors.splice(idx, 1);
		this.setState(curState);

	}

	handleSearch(idx, category, value ) {
		if (!value || value === '') {
			return
		}
		if (this.props.onQuery) {
			let params = {
				payload: this.buildListQueryParams(category, value, idx),
				callback: this.updateVectorOpts.bind(this, idx),
			};
			this.props.onQuery('master_search', params);
		}
	};

	addVector() {
		let curState = this.state;
		let vector = {
			vName: curState.text,
			category: curState.type,
			sourceId: '',
			srcCategory: curState.type,
			structureId: '',
			negative: 0,
			additionId: '',
			additions: [],
			vectorOpts: [],
			refVectors: []
		};
		if (['disease', 'treatment', 'medicine', 'exam'].indexOf(curState.type) !== -1 && curState.vectors.length > 0) {
			message.info('诊断、治疗、药物、检查不支持分拆映射')
		} else {
			curState.vectors.push(vector)
		}
		this.setState(curState);
	}

	buildAdditionSelect(v, idx) {
		let { extTreeData } = this.props;
		return(
			<Row style={{marginBottom:6}}>
				<Col span={2} style={{marginTop:5}}>扩展属性:</Col>
				<Col span={6}>
					<TreeSelect
						showSearch
						optionFilterProp="children"
						style={{width:'100%'}}
						value={v.additionId}
						treeNodeFilterProp={'title'}
						dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
						treeData={extTreeData}
						placeholder="Please select"
						treeDefaultExpandAll
						allowClear
						onChange={this.onChange.bind(this, idx, 'additionId')}
					/>
				</Col>
			</Row>
		)
	}

	deleteAddition(idx,j) {
		let curState = this.state;
		curState.vectors[idx]['additions'].splice(j, 1);
		this.setState(curState);
	}

	buildAdditionItems(v, idx) {
		return(
			<Row style={{marginBottom:6}}>
				{v.additions.map( (a, j) =>
					<div style={{marginTop:15, display:'inline-block'}}>
						<div style={{marginLeft:15, marginTop:4, display:'inline-block'}}>
							<Popconfirm title="删除扩展属性" onConfirm={this.deleteAddition.bind(this, idx, j)}>
								<span style={{cursor:'pointer'}}><Icon type="minus-circle" style={{color:'red'}}/></span>
							</Popconfirm>
						</div>
						<div style={{marginLeft:5, display:'inline-block'}}>
							<Button>{a.label}</Button>
						</div>
					</div>
				)}
			</Row>
		)
	}

	replaceVector(record, idx) {
		let curState = this.state;
		curState.vectors[idx].sourceId = record.id;
		curState.vectors[idx].vectorOpts = [{
			name: record.text,
			code: record.code,
			id: record.id
		}];
		this.setState(curState)
	}

	textRender(idx, text, record) {
		return (
			<a href="javascript:void(0)" onClick={this.replaceVector.bind(this, record, idx)}>{text}</a>
		);
	}

	buildRefVectors(refVectors, idx) {
		const columns = [
			{title: '名称', dataIndex: 'text', render: this.textRender.bind(this, idx)},
			{title: '编码', dataIndex: 'code'},
		];

		return(
			<Row>
				<Table columns={columns}
				       dataSource={refVectors}
				       pagination={false}
				/>
			</Row>
		)

	}

	buildEditItem(v, idx) {
		const { vectors } = this.state;
		const { bodyTreeData } = this.props;
		let vNameDisabled = true;
		if (vectors.length > 1) {
			vNameDisabled = false
		}
		let extraComp = (
			<Popconfirm title="删除标准矢量" onConfirm={this.deleteVector.bind(this, idx)}>
				<span style={{cursor:'pointer'}}><Icon type="minus-circle" style={{color:'red'}} /> 删除</span>
			</Popconfirm>
		);

		return (
			<Card sytle={{marginTop: 10}} extra={extraComp}>
				<Row style={{marginBottom:6}}>
					<Col span={2} style={{marginTop:5}}>源矢量:</Col>
					<Col span={6}>
						<Input style={{width:'100%'}}
						       value={v.vName}
						       disabled={vNameDisabled}
						       onChange={this.onChange.bind(this, idx, 'vName')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={2} style={{marginTop:5}}>标准矢量:</Col>
					<Col span={8}>
						<Select style={{width:'100%'}}
						        showSearch
						        placeholder={this.props.placeholder}
						        defaultActiveFirstOption={false}
						        showArrow={true}
						        filterOption={false}
						        onSearch={this.handleSearch.bind(this, idx, v.category)}
						        notFoundContent={null}
						        value={'' + v.sourceId}
						        dropdownMatchSelectWidth={false}
						        onSelect={this.onChange.bind(this, idx, 'sourceId')}
						>
							{v.vectorOpts.map( o=> <Select.Option key={''+o.id}>{o.name + '[' + o.code + ']'}</Select.Option>)}
						</Select>
					</Col>
					<Col span={2} offset={1}>
						<Switch style={{marginTop:5}}
						        checked={v.negative}
						        checkedChildren="是" unCheckedChildren="否"
						        onChange={this.onChange.bind(this, idx, 'negative')}
						/>
					</Col>
					<Col span={2} style={{marginTop:5}}>关联部位:</Col>
					<Col span={8}>
						<TreeSelect
							showSearch
							optionFilterProp="children"
							style={{width:'100%', height:32}}
							value={v.structureId}
							treeNodeFilterProp={'title'}
							dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
							treeData={bodyTreeData}
							placeholder="Please select"
							allowClear
							onChange={this.onChange.bind(this, idx, 'structureId')}
						/>
					</Col>
				</Row>
				{(v.category === 'symptom') && <Divider />}
				{(v.category === 'symptom') && this.buildAdditionSelect(v, idx)}
				{(v.category === 'symptom') && this.buildAdditionItems(v, idx)}
				<Divider />
				<Row style={{marginBottom:6}}>
					<Button style={{width:125}} onClick={this.getRefVectors.bind(this, v.vName, v.category, idx)}>参考数据</Button>
				</Row>
				{(v.refVectors && v.refVectors.length > 0) && this.buildRefVectors(v.refVectors, idx)}
			</Card>
		)
	}

	updateVectorRef(idx, data) {
		let curState = this.state;
		curState.vectors[idx].refVectors=data.refVectors;
		this.setState(curState);
	}

	getRefVectors(vName, category, idx) {
		if (!vName || vName === '' || !category || category === '') {
			return
		}
		if (this.props.onQuery) {
			let params = {
				payload: {
					text: vName,
					type: category
				},
				callback: this.updateVectorRef.bind(this, idx),
			};
			this.props.onQuery('get_vector_ref', params);
		}
	}


	buildLabels() {
		const { text, type } = this.state;
		return (
			<Row style={{marginTop: 8}}>
				<Col span={12}>
					<Input.Group compact>
						<Input style={{ width:'50%' }} value={text} disabled={true} />
						<Input style={{ width:'50%' }} value={type} disabled={true} />
					</Input.Group>
				</Col>
			</Row>
		);
	}

	buildHalfLabel() {
		const { text, type, vectors } = this.state;
		const TypeOpts = [
			{k:'症状', v:'symptom'}, {k:'疾病', v:'disease'}, {k:'检查', v:'exam'},
			{k:'药物', v:'medicine'}, {k:'治疗', v:'treatment'},
		];
		let typeDisabled = false;
		if (vectors.length > 0) {
			typeDisabled = true;
		}
		return (
			<Row style={{marginTop: 8}}>
				<Col span={6}>
					<Input style={{ width:'90%' }} value={text} disabled={true} />
				</Col>
				<Col span={6}>
					类型: <Select style={{width:'50%'}}
					            showArrow={true}
					            filterOption={false}
					            notFoundContent={null}
					            value={type}
					            disabled={typeDisabled}
					            dropdownMatchSelectWidth={false}
					            onSelect={this.onChange.bind(this, 0, 'type')}>
						{TypeOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
					</Select>
				</Col>
			</Row>
		);
	}

	render() {
		const { id, text, type, vectors, status, emrId, entity} = this.state;
		const { visible } = this.props;
		let title = '矢量归一';
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        width={900}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Card style={{width: '100%'}} id={this.props.id}>
					{/*this.buildLabels()*/}
					{this.buildHalfLabel()}
					<Row style={{marginTop: 8}} id={'edit-item-' + id}>
						<Col span={12}>
							<Button style={{color:'green'}} onClick={::this.addVector}>
								<Icon type="plus-circle" />添加矢量
							</Button>
						</Col>
					</Row>
					<Row style={{marginTop: 8}}>
						{ vectors.map( (v, idx) => this.buildEditItem(v, idx)) }
					</Row>
				</Card>
			</Modal>
		);
	}
}

export default class NormalTaskListPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',
			filterStatus: 'WAITING',
			data: [],
			total: 0,
			showPopup: false,
			spinning: false,
			activeId: 0
		};
	}

	componentDidMount() {
		let curState = this.state;
		curState['spinning'] = true;
		this.setState(curState, this.fetchListData());
	}

	fetchListData() {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: this.buildListQueryParams(),
			callback: this.updateList.bind(this),
		};
		onQuery('normal_task_list', params);
	}

	buildListQueryParams() {
		const { page, pageSize, keyword, filterStatus } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
		};
		if (keyword) {
			params.keyword = keyword;
		}
		if (filterStatus) {
			params.status = filterStatus
		}
		return params;
	}

	updateList(data) {
		let { page, pageSize } = this.state;
		let totalPage = Math.ceil(data.total/pageSize);

		if (totalPage > 0 && page > totalPage) {
			page = totalPage
		}
		this.setState({
			data: data.normTasks,
			page: page,
			total: data.total,
			bodyStructures: data.bodyStructures,
			bodyTreeData: buildTreeData(data.bodyStructures, 'name', 'id', 'id'),
			extensions: data.extensions,
			extTreeData: buildTreeData(data.extensions, 'name', 'id', 'id'),
			spinning: false
		});
	}

	updateList1(data) {
		let { page, pageSize } = this.state;
		let totalPage = Math.ceil(data.total/pageSize);
		if (page > totalPage) {
			page = totalPage
		}

		this.setState({
			spinning: false,
			page: page,
			data: data.normTasks,
			total: data.total,
		});
	}


	onShowNewPopup() {
		let x = {
			id: 0,
			vName: '',
			vectorId: '',
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	gotoRef(emrId, entity) {
		if (this.props.onSwitchTab) {
			let params = {
				id: emrId,
				tabRef: 'ModelHighlight',
				entity: entity
			};
			this.props.onSwitchTab(params)
		}
	}

	onChange(tag, val) {
		let curStatus = this.state;
		curStatus[tag] = val;
		if (tag == 'filterStatus') {
			curStatus['page'] = 1;
		}
		this.setState(curStatus, this.fetchListData())
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		}
		curState[tag] = realVal;
		this.setState(curState);
	}

	searchMappingData() {
		this.setState({
			page: 1,
			spinning: true,
		}, this.fetchListData.bind(this));
	}

	buildOpBar() {
		const { keyword, filterStatus } = this.state;
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					关键词: <Input.Search style={{width: '80%'}}
					                   value={keyword}
					                   onChange={this.onChangeElement.bind(this, 'input', 'keyword')}
					                   onSearch={this.searchMappingData.bind(this)}
				/>
				</Col>
				<Col span={4} offset={1}>
					<Select style={{width:'100%'}} showArrow={true}
					        value={filterStatus}
					        onSelect={this.onChange.bind(this, 'filterStatus')}
					>
						{taskStatusOpts.map( o=> <Select.Option key={''+o.v}>{o.k}</Select.Option>)}
					</Select>
				</Col>
			</Row>
		);
	}

	editItem(record) {
		this.setState({
			showPopup: true,
			hotOne: record,
		});
	}

	onSubmit(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.realEditItem.bind(this, record);
		}
		this.setState({
			showPopup: false,
			hotOne: record,
		}, callback);
	}

	realEditItem(record) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList1.bind(this),
		};
		onQuery('do_norm_task_one', params);
	}

	onDeleteItem(record) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				id: record.id,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList1.bind(this),
		};
		onQuery('delete_prop_mapping_one', params);
	}

	doUpdateTask(status, record) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				updateParams: {
					id: record.id,
					status: status
				},
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList1.bind(this),
		};
		if (status === 'TAGGING') {
			params.payload.updateParams.emrId=record.emrId;
			params.payload.updateParams.remark=record.text + '[' + record.type + ']';
		}
		onQuery('update_norm_task_one', params);
	}

	updateTask(status, record) {
		let curState = this.state;
		curState['spinning'] = true;
		this.setState(curState, this.doUpdateTask.bind(this, status, record))
	}

	opRender(text, record, index) {
		let refDisabled = false;
		let disabled = false;
		if (record.emrId === '') {
			refDisabled = true
		}
		if (record.status !== 'WAITING'){
			disabled = true;
			refDisabled = true;
		}
		let editOp = (<lable><Icon type="edit" theme="outlined"/>做任务</lable>);
		let referOp = (<lable style={{marginLeft:8}}><Icon type="read" theme="outlined"/>参考</lable>);
		let taggingOp = (<lable style={{marginLeft:8}}><Icon type="tag" theme="outlined"/>重新标注</lable>);
		let discardOp = (<lable style={{marginLeft:8}}><Icon type="delete" theme="outlined"/>丢弃</lable>);
		if (!refDisabled) {
			referOp = (
				<span className={styles.ListOpEdit}
				      onClick={this.gotoRef.bind(this, record.emrId, record.entity)} style={{marginLeft: 8}}>
					<Icon type="read" theme="outlined"/>参考
				</span>
			);
			taggingOp = (
				<span className={styles.ListOpEdit} style={{marginLeft:8}}>
				<Popconfirm title="确定重新标注"
				            disabled={refDisabled}
				            onConfirm={this.updateTask.bind(this, 'TAGGING', record)}
				            onCancel={null}>
					<Icon type="tag" theme="outlined"/>重新标注
				</Popconfirm>
			</span>
			);
		}
		if (!disabled) {
			editOp = (
				<span className={styles.ListOpEdit}
				      onClick={this.editItem.bind(this, record)}>
					<Icon type="edit" theme="outlined"/>做任务
				 </span>
			);
			discardOp = (
				<span className={styles.ListOpDisable} style={{marginLeft:8}}>
					<Popconfirm title="确定丢弃"
					            disabled={disabled}
					            onConfirm={this.updateTask.bind(this, 'DISCARD', record)}
					            onCancel={null}>
						<Icon type="delete" theme="outlined" />丢弃
					</Popconfirm>
				</span>
			);
		}
		return (
			<div>
				{editOp}
				{referOp}
				{taggingOp}
				{discardOp}
			</div>
		);
	}

	onListPageChange(page, pageSize) {
		this.setState({
			spinning: true,
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	statusRender(text) {
		return(
			<div>{taskStatusDict[text]}</div>
		)
	}

	render() {
		const { page, pageSize, showPopup, data, total, hotOne, bodyTreeData, extTreeData, spinning } = this.state;
		const { onQuery } = this.props;
		const columns = [
			{dataIndex:'id', title:'ID'},
			{dataIndex:'text', title:'矢量名称'},
			{dataIndex:'type', title:'类型'},
			{dataIndex:'status', title:'状态', render: this.statusRender.bind(this)},
			{dataIndex:'op', title:'操作', render: this.opRender.bind(this)}
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
			<div style={{width:1000, backgroundColor:'white', padding:10}}>
				{this.buildOpBar()}
				<Spin spinning={spinning}>
					<Table columns={columns}
					       dataSource={data}
					       pagination={pageOpts}
					/>
				</Spin>
				<NormalTaskOnePanel visible={showPopup}
				                    item={hotOne}
				                    onQuery={onQuery}
				                    bodyTreeData={bodyTreeData}
				                    extTreeData={extTreeData}
				                    onSubmit={this.onSubmit.bind(this)}
				/>
			</div>
		);
	}
}
