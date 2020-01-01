import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Popconfirm, message, Button, Tabs, Card,
	Tooltip, Collapse, Divider } from 'antd';
import ElementComponent from '../../Template/ElementComponent';
import LogPanel from '../common/LogPanel';
import * as TaskUtils from '../common/TaskTrainUtils';
import * as CmpUtils from './TaggingModelUtils';

import styles from '../TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';
import debounce from 'lodash/debounce';

export default class TaggingModelPerformancePanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			idSelects: [
				{tag: 'idLeft', title: '模型1', val:'', options:[]},
				{tag: 'idRight', title: '模型2', val:'', options:[]}
			],
			performance: [],
			better: {},
		};
		this.selectModelList = debounce(this.selectModelList, 500);
	}

	componentDidMount() {
		// TODO later
	}

	updatePerformanceList(data) {
		let better = {};
		if (data.length>1) {
			//compare side-by-side
			better = CmpUtils.comparePerformancePair(data[0].performance, data[1].performance);
		}
		this.setState({
			performance: data,
			better: better,
		});
	}

	fetchData() {
		const { idSelects } = this.state;
		if (!this.props.onQuery) {
			return;
		}

		let ids = [];
		for (let i=0; i<idSelects.length; i++) {
			let x = parseInt(idSelects[i].val);
			if (isNaN(x)) {
				continue;
			}
			ids.push(x);
		}
		let params = {
			payload: {
				type: 'tagging',
				ids: ids,
			},
			callback: this.updatePerformanceList.bind(this),
		}
		this.props.onQuery('get-task-performance', params);
	}

	updateModelList(index, data) {
		let curState = this.state;
		let opts = [];
		for (let i=0; i<data.tasks.length; i++) {
			let curI = data.tasks[i];
			let k = curI.tag;
			if (k.length > 28) {
				k = (curI.tag).substr(0, 3) + '...' + (curI.tag).substr(-22);
			}
			opts.push({
				k: k,
				v: '' + curI.id,
			});
		}
		curState.idSelects[index].options = opts;
		this.setState(curState);
	}

	selectModelList(index, keyword) {
		if (!this.props.onQuery) {
			return;
		}
		let params = {
			payload: {
				type: 'tagging',
				page: 1,
				pageSize: 200,
				keyword: keyword,
			},
			callback: this.updateModelList.bind(this, index),
		}
		this.props.onQuery('get-task-list', params);
	}

	onChangeElementArray(elementType, index, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		}
		curState.idSelects[index][tag] = realVal;
		this.setState(curState);
	}

	buildSelectModelOne(item, index, allData) {
		return (
			<Col span={10}>
				{item.title + ': '} <Select style={{width:'85%'}}
                   showSearch
                   value={item.val}
                   defaultActiveFirstOption={false}
                   showArrow={false}
                   filterOption={false}
                   onSearch={this.selectModelList.bind(this, index)}
                   onChange={this.onChangeElementArray.bind(this, 'select', index, 'val')}
                   notFoundContent={null}
				>
					{item.options.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
				</Select>
			</Col>
		);
	}

	buildSelectBar() {
		const { idSelects } = this.state;
		return (
			<Card title="模型选择">
				<Row gutter={8}>
					{idSelects.map(this.buildSelectModelOne.bind(this))}
					<Col span={3} style={{marginLeft:6}}>
						<Button onClick={this.fetchData.bind(this)}
							type="primary">加载性能数据</Button>
					</Col>
				</Row>
			</Card>
		);
	}

	buildOneSideConfig(item) {
		let config = {};
		if (item.config) {
			config = JSON.parse(item.config);
		}
		return (
			<div>
				<Divider style={{fontSize:20,fontWeight:'bold'}}>配置信息</Divider>
				<Row>数据源: {config.source}</Row>
				<Row>包含基本数据: {config.includeBase ? '是':'否'}</Row>
				<Row>词矢量: {config.word2vecDim}维</Row>
			</div>
		);
	}

	buildPerformanceItem(performance, indexModel, item, index, allData) {
		const { better } = this.state;
		let title = item.title;
		if (!item.title) {
			title = item.tag;
		}
		let compareIcon = null;
		if (indexModel == 1) {
			// this is target we care about
			let compare = better[item.tag];
			if (compare == 'up') {
				compareIcon = (
					<Col span={4}><Icon style={{color:'red'}} type="like" /></Col>
				);
			} else if (compare == 'down') {
				compareIcon = (
					<Col span={4}><Icon style={{color:'black'}} type="dislike" /></Col>
				);
			} else {
				compareIcon = (
					<Col span={4}></Col>
				);
			}
		}
		let component = (
			<Row>
				{compareIcon}
				<Col span={6} style={{textAlign:'right'}}>{title}:</Col>
				<Col span={10} offset={1}>{performance[item.tag]}</Col>
			</Row>
		);
		return component;
	}

	buildSummary(item, index) {
		let performance = item.performance;
		let SummaryItems = CmpUtils.SummaryItems;
		return (
			<div>
				<Divider style={{fontSize:20,fontWeight:'bold'}}>汇总信息</Divider>
				{SummaryItems.map(this.buildPerformanceItem.bind(this, performance, index))}
			</div>
		);
	}

	buildPerformanceItemL2(performancel2, tag, indexModel, item, index, allData) {
		const { better } = this.state;
		let curBetter = better[tag];
		let title = item.title;
		if (!item.title) {
			title = item.tag;
		}
		let compareIcon = null;
		if (indexModel == 1) {
			// this is target we care about
			let compare = curBetter[item.tag];
			if (compare == 'up') {
				compareIcon = (
					<Col span={4}><Icon style={{color:'red'}} type="like" /></Col>
				);
			} else if (compare == 'down') {
				compareIcon = (
					<Col span={4}><Icon style={{color:'black'}} type="dislike" /></Col>
				);
			} else {
				compareIcon = (
					<Col span={4}></Col>
				);
			}
		}
		let component = (
			<Row>
				{compareIcon}
				<Col span={6} style={{textAlign:'right'}}>{title}:</Col>
				<Col span={10} offset={1}>{performancel2[item.tag]}</Col>
			</Row>
		);
		return component;
	}

	buildPerformanceItemL1(performance, indexModel, item, index, allData) {
		const { better } = this.state;
		let title = item.title;
		if (!item.title) {
			title = item.tag;
		}
		let detailTags = CmpUtils.Detail2Items;
		return (
			<div>
				<Row>{title}</Row>
				{detailTags.map(this.buildPerformanceItemL2.bind(this, performance[item.tag], item.tag, indexModel))}
			</div>
		);
	}

	buildDetail(item, index) {
		let performance = item.performance;
		let DetailItems = CmpUtils.DetailItems;
		return (
			<div>
				<Divider style={{fontSize:20,fontWeight:'bold'}}>细节信息</Divider>
				{DetailItems.map(this.buildPerformanceItemL1.bind(this, performance, index))}
			</div>
		);
	}

	buildOneSidePerformance(item, index, allData) {
		return (
			<Col span={12}>
				<Card>
					{this.buildOneSideConfig(item)}
					{this.buildSummary(item, index)}
					{this.buildDetail(item, index)}
				</Card>
			</Col>
		);
	}

	render() {
		const { performance } = this.state;
		return (
			<div style={{width:1000, backgroundColor:'white', padding:20}}>
				{this.buildSelectBar()}
				<Row gutter={8} style={{marginTop:6}}>
					{performance.map(this.buildOneSidePerformance.bind(this))}
				</Row>
			</div>
		);
	}
}
