import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Card, message, Button, Popconfirm, Tabs } from 'antd';
import ElementComponent from '../../Template/ElementComponent';
import VectorTable from './VectorTable';
import { Tagger } from '../TaggingSub/Tagger';
import * as TUtils from '../TaggingSub/TaggingUtils';

import styles from '../MasterData.less';
let underscore = require('underscore');
let moment = require('moment');

export default class ModelHighlightPanel extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props);
	}

	buildColorLines(itemPerLine) {
		let lines = [];
		let itemMax = TUtils.TagColorSetting.length;
		let colors = TUtils.TagColorSetting;
		let idx = 0;
		let curLine = [];
		while (true) {
			if (idx >= itemMax) {
				break;
			}
			curLine.push(colors[idx]);
			if (curLine.length == itemPerLine) {
				lines.push(curLine);
				curLine = [];
			}
			idx += 1;
		}
		if(curLine.length>0) {
			lines.push(curLine);
		}
		return lines;
	}

	initData(props) {
		let colorLines = this.buildColorLines(6);

		let x = {
			parseWordsSeq:[],
			entity: [],
		};
		let y = {
			content: '',
			label: JSON.stringify(x)
		};
		// let y = TUtils.mockData();
		let vectors = {
			lossless: [],
			normalized: [],
		};
		// let vectors = TUtils.mockVectors();
		let newState = {
			id: 0,
			tagging: y,
			vectors: vectors,
			highlight: [],
			params: {},
			touchIndex: -1,
			colorLines: colorLines,
		};
		return newState;
	}

	fetchEmrInfo() {
		const { onQuery } = this.props;
		const { params } = this.state;
		if (!params.id || !onQuery) {
			return;
		}
		let paramsK = {
			payload: {
				id: params.id
			},
			callback: this.updateAll.bind(this)
		};
		onQuery('emr_refer', paramsK);
	}

	directSetEmr(params) {
		let callback = this.fetchEmrInfo.bind(this, params);
		this.setState({
			params: params,
		}, callback);
	}

	updateAll(result) {
		let params = this.state.params;
		let data = result.emrRefer;
		let parseWordsSeq = [];
		let curState = this.state;
		let x = {
			parseWordsSeq: parseWordsSeq,
			entity: data.entity,
		};
		let y = {
			content: data.source,
			label: JSON.stringify(x)
		};
		curState.tagging = y;

		let vectors = {
			lossless: data.lossless,
			normalized: data.normalized,
		};
		curState.vectors = vectors;

		curState.touchIndex = -1;

		let entity = (params.entity) ? params.entity : {};
		let callback = this.onSelectVectorItem.bind(this, entity);
		this.setState(curState, callback);
	}

	onShowAllEvents() {
		this.setState({
			touchIndex: -1,
		});
	}

	buildDescItem(item) {
		return (
			<Col xs={4}>
				<div className="nlp_circle" style={{backgroundColor:item.color}} />
				<label>{item.description}</label>
			</Col>
		)
	}

	buildDescLine(lineOne) {
		return (
			<Row>
				{lineOne.map(this.buildDescItem.bind(this))}
			</Row>
		);
	}

	buildBasic() {
		let lines = this.state.colorLines;
		return (
			<Card title="标注颜色表" style={{ padding: 0 }}>
				{lines.map(this.buildDescLine.bind(this))}
			</Card>
		);
	}

	onSelectPosFromTaggingView(idx) {
		this.setState({
			touchIndex: idx,
		});
	}

	buildTaggingEditor() {
		const { id, tagging } = this.state;
		let taggerDefaultColor = '#ffcc00';
		let tagProps = TUtils.TagColorSetting;
		return (
			<div className='bbTable bbTable_tab2' style={{marginTop: 10}}>
				<Tagger tag={"entity_"+id} ref="taggerBB"
				        data={tagging}
				        tools={['BATCH','SPLIT','REVOKE','RECOVERY']}
				        defaultColor={taggerDefaultColor}
				        onChange={null}
				        tagProps={tagProps}
				        op='view'
				        showColorSelector={false}
				        onSelectView={this.onSelectPosFromTaggingView.bind(this)}
				/>
			</div>
		);
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

	buildVectorTable() {
		const { vectors, touchIndex } = this.state;
		let nowTs = moment().format('YYYY-MM-DD');
		return (
			<Tabs className="sdpTabs" type="card" animated={false} style={{marginTop:5}}>
				<Tabs.TabPane tab="原始事件" key="lossless">
					病历基准时间：{nowTs}
					<VectorTable tag="lossless"
					             data={vectors.lossless}
					             touchIndex={touchIndex}
					             onSelectRow={this.onSelectVectorItem.bind(this)}
					/>
				</Tabs.TabPane>
				<Tabs.TabPane tab="规范事件" key="normalized">
					病历基准时间：{nowTs}
					<VectorTable tag="normalized"
					             data={vectors.normalized}
					             touchIndex={touchIndex}
					             onSelectRow={this.onSelectVectorItem.bind(this)}
					/>
				</Tabs.TabPane>
			</Tabs>
		);
	}

	render() {
		return (
			<div style={{width:1000, backgroundColor:'white', padding:10}}>
				{this.buildBasic()}
				<Row gutter={8}>
					<Col span={12}>
						<Row style={{textAlign:'center', marginTop:10, height:30}}>
							标注区
						</Row>
						{this.buildTaggingEditor()}
					</Col>
					<Col span={12}>
						<Row style={{textAlign:'center', marginTop:10, height:30}}>
							事件区 <Button onClick={this.onShowAllEvents.bind(this)}
							style={{marginLeft:6}} type="primary">展示所有事件</Button>
						</Row>
						{this.buildVectorTable()}
					</Col>
				</Row>
			</div>
		);
	}
}
