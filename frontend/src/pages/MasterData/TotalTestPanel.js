import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Tabs, Card } from 'antd';
import ElementComponent from '../Template/ElementComponent';
import { Tagger } from '../MasterData/TaggingSub/Tagger';
import * as TUtils from '../MasterData/TaggingSub/TaggingUtils';
import VectorTable from '../MasterData/NormalSub/VectorTable';

import styles from './MasterData.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';
let moment = require('moment');

@connect(({ totalTestPanel }) => ({
	totalTestPanel
}))
export default class TotalTestPanel extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {
			visit_start_at: moment(),
			ageVal: {phase: '其他', number:'6'},
			gender: 'M',
			clinicNote: '',

			taggerContent: null,
			lossless: null,
			normalized: null,
			touchIndex: -1,
		};
	}

	componentDidMount() {
		// TODO get all versions
	}

	isValidContent() {
		const { visit_start_at, ageVal, gender, clinicNote } = this.state;
		let msgs = [];
		if (!visit_start_at) {
			msgs.push('选择问诊时间');
		}
		if (!gender) {
			msgs.push('选择性别');
		}
		if (!clinicNote) {
			msgs.push('填写病历');
		}
		if (ageVal.number == 0) {
			msgs.push('填写年龄');
		}
		let rst = {
			ok: true,
			errMsg: '',
		};
		if (msgs.length > 0) {
			rst.ok = false;
			rst.errMsg = msgs.join(',');
		}
		return rst;
	}

	buildParams() {
		const { visit_start_at, ageVal, gender, clinicNote } = this.state;
		let data = {
			birthday: this.computeBirthday(ageVal, visit_start_at.format('YYYY-MM-DD')),
			gender: gender,
			content: clinicNote,
			visit_start_at: visit_start_at.format('YYYY-MM-DD HH:mm:ss')
		};
		return data;
	}

	onDoTest() {
		const { dispatch } = this.props;
		let rst = this.isValidContent();
		if (!rst.ok) {
			message.error(rst.errMsg);
			return;
		}

		dispatch({
			type: 'totalTestPanel/fetch',
			payload: {
				mode: 'nlp',
				data: this.buildParams()
			},
			callback: this.updateAll.bind(this)
		});
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
			taggerContent: taggerContent,
			lossless: data.lossless,
			normalized: data.normalized,
			touchIndex: -1,
		});
	}

	buildBasicInfo() {
		const Lines = [
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'性别', tag:'gender',
					options: [{k:'男', v:'M'},{k:'女', v:'F'}]
				}, {
					layout: {title:6, element:16}, elementType:'ageSelector',
					title:'年龄', tag:'ageVal'
				}, {
					layout: {title:6, element:16}, elementType:'datePickerSimple',
					title:'就诊时间', tag:'visit_start_at',
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:21}, elementType:'textArea',
					title:'病历内容', tag:'clinicNote'
				}]
			},
		];
		let extra = (
			<Button type="primary" onClick={this.onDoTest.bind(this)}>测试</Button>
		);
		return (
			<Card title="病历信息" size="small" extra={extra}>
				{Lines.map(this.renderLine.bind(this))}
			</Card>
		);
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
		);
	}

	onShowAllEvents() {
		this.setState({
			touchIndex: -1,
		});
	}

	onSelectVectorItem(entityOne) {
		// {"misc": {"deco": [], "tags": [[10, 14, "pathogen", "曾吃过海鲜"]], "timex3": [{}]},
		//  "normalization": 0, "source": "pathogen", "text": "曾吃过海鲜", "time": "2017-12-12", "type": "disease",
		// "value": 1}
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