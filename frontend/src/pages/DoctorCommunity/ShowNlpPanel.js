import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Tabs, Card } from 'antd';
import ElementComponent from '../Template/ElementComponent';
import { Tagger } from '../MasterData/TaggingSub/Tagger';
import * as TUtils from '../MasterData/TaggingSub/TaggingUtils';
import VectorTable from '../MasterData/NormalSub/VectorTable';

import styles from './Community.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ showNlpResult }) => ({
	showNlpResult
}))
export default class ShowNlpPanel extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {
			orgName: '',
			departmentName: '',
			visitId: '',
			visit_start_at: '',

			age: '0',
			birthday: '',
			gender: 'M',
			patientId: '',

			taggerContent: null,
			lossless: null,
			normalized: null,
			touchIndex: -1,
		};
	}

	componentDidMount() {
		const { location, dispatch } = this.props;
		let visit_id = location.query.visit_id;
		if (!visit_id) {
			message.error('无效id!');
			return;
		}

		dispatch({
			type: 'showNlpResult/init',
			payload: {
				visitId: visit_id,
				mode: 'simple'
			},
			callback: this.updateAll.bind(this)
		});
	}

	onReturnList() {
		let webPath = `/doctor-community/export-nlp`;
		this.props.dispatch(routerRedux.push(webPath));
	}

	updateAll(data) {
		let taggerContent = {
			"content": data['content'],
			"label":JSON.stringify({
				"entity": data['entity'],
				"parseWordsSeq":[]
			})
		};
		this.setState({
			orgName: data['org_name'],
			departmentName: data['department_name'],
			visitId: data['id'],
			visit_start_at: data['date'],

			age: data['age'],
			gender: data['gender'],
			patientId: data['patient_id'],

			taggerContent: taggerContent,
			lossless: data.lossless,
			normalized: data.normalized,
		});
	}

	buildBasicInfo() {
		let extra = (
			<Button type="primary" onClick={this.onReturnList.bind(this)}>返回列表</Button>
		);
		const Lines = [
			{
				split: 12,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'机构', tag:'orgName'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'科室', tag:'departmentName',
				}]
			},
			{
				split: 12,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'就诊号', tag:'visitId'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'就诊时间', tag:'visit_start_at',
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'患者ID', tag:'patientId'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'年龄', tag:'age',
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'性别', tag:'gender',
				}]
			},
		];
		return (
			<Card title="基本信息" size="small" extra={extra}>
				{Lines.map(this.renderLine.bind(this))}
			</Card>
		)
	}

	onSelectPosFromTaggingView(idx) {
		this.setState({
			touchIndex: idx,
		});
	}

	buildTagger() {
		const { taggerContent } = this.state;
		if (!taggerContent) {
			return null;
		}

		return (
			<Card title="内容区" size="small">
				<div className='bbTable bbTable_tab2' style={{marginTop: 10}}>
					<Tagger tag={"entity_0"} ref="taggerBB"
					        data={taggerContent}
					        tools={[]}
					        defaultColor={'#ffcc00'}
					        onChange={null}
					        tagProps={TUtils.TagColorSetting}
					        op='view'
					        showColorSelector={true}
					        tagStyle={{tagPerLine:4}}
					        onSelectView={this.onSelectPosFromTaggingView.bind(this)}
					/>
				</div>
			</Card>
		)
	}

	onSelectVectorItem(entityOne) {
		// {"misc": {"deco": [], "tags": [[10, 14, "pathogen", "曾吃过海鲜"]], "timex3": [{}]}, "normalization": 0, "source": "pathogen", "text": "曾吃过海鲜", "time": "2017-12-12", "type": "disease", "value": 1}
		if (!entityOne.misc || !entityOne.misc.tags || entityOne.misc.tags.length == 0) {
			return;
		}
		let tags = entityOne.misc.tags;
		let rangePos = [tags[0][0], tags[0][1]];
		for (let i=1; i<tags.length; i++) {
			let curT = tags[i];
			rangePos[0] = Math.min(curT[0], rangePos[0]);
			rangePos[1] = Math.max(curT[1], rangePos[1]);
		}
		this.refs['taggerBB'].drawEdgeHighlight(rangePos);
	}

	onShowAllEvents() {
		this.setState({
			touchIndex: -1,
		});
	}

	buildVectorTable() {
		const { lossless, normalized, touchIndex } = this.state;
		if (!lossless || !normalized) {
			return null;
		}

		let extra = (
			<Button onClick={this.onShowAllEvents.bind(this)}
			        style={{marginLeft:6}} type="primary">展示所有事件</Button>
		);
		return (
			<Card title="事件区" size="small" extra={extra}>
				<Tabs className="sdpTabs" type="card" animated={false} style={{marginTop:5}}>
					<Tabs.TabPane tab="原始事件" key="lossless">
						 <VectorTable tag="lossless"
							 data={lossless}
							 touchIndex={touchIndex}
							 onSelectRow={this.onSelectVectorItem.bind(this)}
						 />
					 </Tabs.TabPane>
					<Tabs.TabPane tab="规范事件" key="normalized">
						<VectorTable tag="normalized"
				             data={normalized}
				             touchIndex={touchIndex}
				             onSelectRow={this.onSelectVectorItem.bind(this)}
						/>
					</Tabs.TabPane>
				</Tabs>
			</Card>
		);
	}

	render() {
		return (
			<div style={{minWidth:1000, backgroundColor:'white', padding:20}}>
				{this.buildBasicInfo()}
				<Row>
					<Col span={12}>
						{this.buildTagger()}
					</Col>
					<Col span={12}>
						{this.buildVectorTable()}
					</Col>
				</Row>
			</div>
		);
	}
}
