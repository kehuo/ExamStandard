import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, Breadcrumb, Popover, Card,
	 Checkbox } from 'antd';
import ElementComponent from '../../Template/ElementComponent';
import { Tagger } from './Tagger';

import * as TUtils from './TaggingUtils';
import styles from '../MasterData.less';
let underscore = require('underscore');
let moment = require('moment');

export default class TaggingEditorPanel extends ElementComponent {
	constructor(props) {
		super(props);
		let x = {
			parseWordsSeq:[],
			entity: [],
		};
		let y = {
			content: '',
			label: JSON.stringify(x)
		};
		this.state = {
			id: 0,
			status: '',
			remark: '',
			created_at: '',
			updated_at: '',
			emr_category: '',
			result: y,     // y, TUtils.mockData()
			newResult: null,
			forceConfirm: true,
			tagTs: moment().format('YYYYMMDDHHmmss'),
		};
	}

	componentDidMount() {
		this.fetchTaskOne();
	}

	fetchTaskOne() {
		const { onQuery } = this.props;
		const { id } = this.state;
		if (!id || !onQuery) {
			return;
		}
		let params = {
			payload: {
				id: id
			},
			callback: this.updateTaskInfo.bind(this)
		};
		onQuery('get-one', params);
	}

	directSetTaskId(taskId) {
		this.setState({
			id: taskId,
			// tagTs: moment().format('YYYYMMDDHHmmss'),
		}, this.fetchTaskOne.bind(this));
	}

	updateTaskInfo(data) {
		let x = {
			parseWordsSeq:[],
			entity: JSON.parse(data.result),
		};
		let y = {
			content: data.emr_text,
			label: JSON.stringify(x)
		};
		let newState = {
			id: data.id,
			tagTs: moment().format('YYYYMMDDHHmmss'),
			status: data.status,
			remark: data.remark,
			created_at: data.created_at,
			updated_at: data.updated_at,
			emr_category: data.emr_category,
			result: y,
			newResult: null,
		};
		this.setState(newState);
	}

	backToList() {
		if (this.props.onSwitchTab) {
			let params = {
				tabKey: 'TaskList',
			};
			this.props.onSwitchTab(params);
		}
	}

	onSubmit() {
		const { onQuery } = this.props;
		const { id, status, remark, result, newResult, forceConfirm } = this.state;
		if (!id || !onQuery) {
			return;
		}
		let x = null;
		if (newResult) {
			x = JSON.stringify(newResult);
		} else {
			let y = JSON.parse(result.label);
			x = JSON.stringify(y.entity);
		}
		let newStatus = status;
		if (forceConfirm) {
			newStatus = 'CONFIRMED';
		} else {
			newStatus = 'FINISHED';
		}
		let params = {
			payload: {
				id: id,
				status: newStatus,
				remark: remark,
				result: x,
			},
			callback: this.backToList.bind(this)
		};
		onQuery('edit-one', params);
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
		this.setState(curState);
	}

	buildBasic() {
		const { status, forceConfirm } = this.state;
		const lines = [
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'input',
					title:'序号', tag:'id', disabled: true
				}, {
					layout: {title:6, element:16}, elementType:'input',
					title:'创建时间', tag:'created_at', disabled: true
				}, {
					layout: {title:6, element:16}, elementType:'input',
					title:'修改时间', tag:'updated_at', disabled: true
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'文本类型', tag:'emr_category', disabled: true,
					options: TUtils.ContentTypeOpts
				}, {
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'状态', tag:'status', disabled: true,
					options:TUtils.StatusOptsNoAll
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 16}, elementType: 'textArea',
					title: '备注', tag: 'remark'
				}]
			},
		];
		let btnComp = (
			<Button onClick={this.onSubmit.bind(this)} type="primary"
			        style={{marginRight:20}}
			>
				提交
			</Button>
		);
		let forceConfirmComp = (
			<Checkbox checked={forceConfirm} style={{marginLeft:6}}
				onClick={this.onChangeElement.bind(this, 'checkbox', 'forceConfirm')} >
				审批通过
			</Checkbox>
		);

		return (
			<Card title="任务信息">
				{lines.map(this.renderLine.bind(this))}
				<Row style={{textAlign:'right'}}>
					{btnComp}
					{forceConfirmComp}
				</Row>
			</Card>
		);
	}

	onTagger(propName, data, tag){
		// modified data as result
		this.setState({
			newResult: data
		});
	}

	buildTaggingEditor() {
		const { id, result, status, tagTs } = this.state;
		if (!status) {
			return (
				<div>暂无数据</div>
			);
		}

		let taggerDefaultColor = '#ffcc00';
		let tagProps = TUtils.TagColorSetting;
		return (
			<div className='bbTable bbTable_tab2' >
				<Tagger tag={"entity_"+id+tagTs}
				        data={result}
				        tools={['BATCH','SPLIT','REVOKE','RECOVERY']}
				        defaultColor={taggerDefaultColor}
				        onChange={this.onTagger.bind(this)}
				        tagProps={tagProps}
				        op='edit'
				/>
			</div>
		);
	}

	render() {
		return (
			<div style={{width:1000, backgroundColor:'white', padding:10}}>
				{this.buildBasic()}
				{this.buildTaggingEditor()}
			</div>
		);
	}
}
