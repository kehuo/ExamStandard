import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, Popconfirm, Modal, TreeSelect, Spin, Card, Switch, Divider, Pagination } from 'antd';
import { buildTreeData } from '../../../utils/utils'
import debounce from 'lodash/debounce'
let _ = require('lodash');
import styles from '../MasterData.less';
let underscore = require('underscore');

const VECTORTYPES = [
	{k:'症状',v:'symptom'},
	{k:'检查',v:'exam'},
	{k:'药物',v:'medicine'},
	{k:'疾病',v:'disease'},
	{k:'治疗',v:'treatment'},
];

const TASK_STATUS = [
	{k: '未完成', v: 'WAITING'},
	{k: '丢弃',  v: 'DISCARD'},
	{k: '完成', v: 'FINISHED'},
	{k: '重新标注', v: 'TAGGING'},
	{k: '所有任务', v: 'ALL'}
];

let MockData = [
	{id: 1, text: '呕吐', type: 'symptom', emrId: 'xxxxxxxxxxxx1', entity:[]},
	{id: 2, text: '血常规', type: 'exam', emrId: '', entity:[]},
	{id: 3, text: '腹泻', type: 'disease', emrId: 'xxxxxxxxxxx2', entity:[]},
];

class TaskItemCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
		this.handleSearch = debounce(this.handleSearch, 500);
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


	onSubmit() {
		const { id, text, type, vectors } = this.state;
		if (!this.props.onSubmit) {
			return;
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

	updateTask(status, taskId, emrId) {
		if (this.props.updateTask) {
			this.props.updateTask(status, taskId, emrId)
		}
	}

	updateVectorOpts(idx, data) {
		let items = data['items'];
		let curState = this.state;
		curState.vectors[idx].vectorOpts=items;
		this.setState(curState);
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
		} else {
			curState.vectors[idx][tag] = val;
		}
		this.setState(curState);
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

	onActive() {
		if (this.props.onActive) {
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
			};
			if (curState.id != this.props.activeId && curState.vectors.length === 0) {
				curState.vectors.push(vector);
			} else if (curState.id === this.props.activeId && ['disease', 'treatment', 'medicine'].indexOf(curState.type) === -1 ) {
				curState.vectors.push(vector);
			} else if (curState.id === this.props.activeId && ['disease', 'treatment', 'medicine', 'exam'].indexOf(curState.type) !== -1 && curState.vectors.length > 0) {
				message.info('诊断、治疗、药物、检查不支持分拆映射')
			}
			this.setState(curState, this.props.onActive(curState.id));
		}
	}

	deleteVector(idx) {
		let curState = this.state;
		curState.vectors.splice(idx, 1);
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

	buildEditItem(v, idx) {
		const { vectors } = this.state
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
		const ButtonStyle = {marginLeft:10, width:125};

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
			</Card>
		)
	}

	render() {
		const { id, text, type, vectors, status, emrId, entity} = this.state;
		const { activeId } = this.props;
		const ButtonStyle = {marginLeft:10, width:125};
		let taskStatusItem = _.find(TASK_STATUS, {v: status});
		let taskStatus = '未知';
		let refDisabled = false;
		let addDisabled = false;
		let disabled = false;
		if (emrId === '') {
			refDisabled = true
		}
		if (taskStatusItem) {
			taskStatus = taskStatusItem['k']
		}
		if (activeId === id && type !== 'symptom' && vectors.length > 0) {
			addDisabled = true
		}
		if (status !== 'WAITING'){
			disabled = true;
			addDisabled = true;
			refDisabled = true;
		}


		return (
			<Card style={{width: '100%'}} id={this.props.id}>
				{'任务状态：' + taskStatus}
				<Row style={{marginTop: 8}}>
					<Col span={12}>
						<Input.Group compact>
							<Input style={{ width:'50%' }} value={text} disabled={true} />
							<Input style={{ width:'50%' }} value={type} disabled={true} />
						</Input.Group>
					</Col>
					<Col span={10} offset={2}>
						<Button type="primary" style={ButtonStyle} disabled={refDisabled} onClick={this.gotoRef.bind(this, emrId, entity)}>查看参考病历</Button>
						<Button type="primary" style={ButtonStyle} disabled={refDisabled} onClick={this.updateTask.bind(this, 'TAGGING', id, emrId)}>申请重新标注</Button>
					</Col>
				</Row>
				<Row style={{marginTop: 8}} id={'edit-item-' + id}>
					<Col span={12}>
						<Button style={{color:'green'}} disabled={addDisabled} onClick={::this.onActive}>
							<Icon type="plus-circle" />添加矢量
						</Button>
						{ (id===activeId && vectors.length>0) &&
							<Button type="primary" style={ButtonStyle} disabled={disabled} onClick={this.onSubmit.bind(this)}>提交</Button>
						}

					</Col>
					<Col span={10} offset={2}>
						<Button type="primary" style={ButtonStyle} disabled={disabled} onClick={this.updateTask.bind(this, 'DISCARD', id, null)}>丢弃</Button>
					</Col>
				</Row>
				<Row style={{marginTop: 8}}>
				{ (id===activeId) &&
					vectors.map( (v, idx) => this.buildEditItem(v, idx))
				}
				</Row>
			</Card>
		);
	}
}


export default class NormalTaskPanel extends React.Component {
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

	searchMappingData() {
		this.setState({
			spinning: true,
		}, this.fetchListData.bind(this));
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
		this.setState({
			data: data.normTasks,
			total: data.total,
			bodyStructures: data.bodyStructures,
			bodyTreeData: buildTreeData(data.bodyStructures, 'name', 'id', 'id'),
			extensions: data.extensions,
			extTreeData: buildTreeData(data.extensions, 'name', 'id', 'id'),
			spinning: false
		});
	}

	updateList1(data) {
		this.setState({
			spinning: false,
			data: data.normTasks,
			total: data.total,
		});
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

	onChange(tag, val) {
		let curStatus = this.state;
		curStatus[tag] = val;
		this.setState(curStatus, this.fetchListData())
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
						{TASK_STATUS.map( o=> <Select.Option key={''+o.v}>{o.k}</Select.Option>)}
					</Select>
				</Col>
			</Row>
		);
	}

	onSubmit(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.realEditItem.bind(this, record);
			this.setState({
				spinning: true,
			}, callback);
		}
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

	fetchNewPageData() {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: this.buildListQueryParams(),
			callback: this.updateList1.bind(this),
		};
		onQuery('normal_task_list', params);
	}

	onListPageChange(page, pageSize) {
		this.setState({
			spinning: true,
			page: page,
			pageSize: pageSize
		}, this.fetchNewPageData.bind(this));
	}

	onActive(activeId) {
		let curState = this.state;
		curState.activeId = activeId;
		this.setState(curState);
	}

	updateTask(status, taskId, emrId) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				updateParams: {
					id: taskId,
					status: status
				},
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList1.bind(this),
		};
		if (status === 'TAGGING') {
			params.payload.updateParams.emrId=emrId
		}
		onQuery('update_norm_task_one', params);
	}

	render() {
		const { page, pageSize, spinning, activeId, bodyTreeData, extTreeData, total, data } = this.state;

		const { onQuery } = this.props;
		return (
			<div style={{width:1000, backgroundColor:'white', padding:10}}>
				{this.buildOpBar()}
				<table style={{width: '100%'}}>
					{data.map( task => <TaskItemCard
										id={'TaskItem-' + task.id}
										item={task}
					                    activeId={activeId}
										onActive={::this.onActive}
										bodyTreeData={bodyTreeData}
										extTreeData={extTreeData}
										onQuery={onQuery}
										onSubmit={::this.onSubmit}
										updateTask={::this.updateTask}
										onSwitchTab={this.props.onSwitchTab}
									/>)
					}
					<Pagination size="small"
					            style={{marginTop:10, textAlign:'right'}}
					            page={page}
					            pageSize={pageSize}
					            onChange={this.onListPageChange.bind(this)}
					            total={total}/>
				</table>
			</div>
		);
	}
}
