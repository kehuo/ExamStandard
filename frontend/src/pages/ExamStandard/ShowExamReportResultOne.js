import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Tabs, Card } from 'antd';
import ElementComponent from '../Template/ElementComponent';
import { Tagger } from '../MasterData/TaggingSub/Tagger';
import * as TUtils from '../MasterData/TaggingSub/TaggingUtils';
import LosslessVectorTable from '../ExamStandard/LosslessVectorTable'
import NormalizedVectorTable from './NormalizedVectorTable'

import styles from './ExamStandard.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

// showExamReportResultOne 是 models 里的一个.js文件
@connect(({ showExamReportResultOne }) => ({
	showExamReportResultOne
}))
export default class ShowExamReportResultOne extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {
			id: '',
			taggerContent: null,
			lossless: null,
			normalized: null,
			touchIndex: -1,
		};
	}

	componentDidMount() {
		const { location, dispatch } = this.props;
		let id = location.query.id;

		if (!id) {
			message.error('无效id!');
		}
		dispatch({
			type: 'showExamReportResultOne/init',
			payload: {
				id: id
			},
			callback: this.updateAll.bind(this)
		});
	}

	// 这里触发，返回所有检查报告列表的页面
	onReturnList() {
		let webPath = `/exam-standard/show-exam-report-list`;
		this.props.dispatch(routerRedux.push(webPath));
	}

	// data = 后台返回的 res["data"] 
	// data = {"exam_standard":{"text": "肝脏正常,...", "target": [[tag1], [tag2], ..]}, "norm":[]}
	updateAll(data) {
		let taggerContent = {
			"content": data['text'],
			"label":JSON.stringify({
				"entity": data["target"],
				"parseWordsSeq":[]
			})
		};

		this.setState({
			taggerContent: taggerContent,
			lossless: data.lossless,
			normalized: data.normalized,
		});
	}

	onSelectPosFromTaggingView(idx) {
		this.setState({
			touchIndex: idx,
		});
	}

	// 11-14 huoke注释: 该函数处理标签部分
	buildTagger() {
		const { taggerContent } = this.state;
		if (!taggerContent) {
			return null;
		}

		return (
			<Card title="内容区" size="small">
				<div className='bbTable bbTable_tab2' style={{marginTop: 10}}>
					{/* 11-15周五注释 这个 bbTagger bbTagger-entity_0 就是空出来放标注好的文本的地方 */}
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



	// 11-15 注释  该函数处理右下方部分
	onSelectVectorItem(entityOne) {		
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
						 <LosslessVectorTable tag="lossless"
							 data={lossless}
							 touchIndex={touchIndex}
							 onSelectRow={this.onSelectVectorItem.bind(this)}
						 />
					 </Tabs.TabPane>
					<Tabs.TabPane tab="规范事件" key="normalized">
						<NormalizedVectorTable tag="normalized"
	                        data={normalized}
							touchIndex={touchIndex}
							onSelectRow={this.onSelectVectorItem.bind(this)}
						/>
					</Tabs.TabPane>
				</Tabs>
			</Card>
		);

		// return (
		// 	// <Card title="事件区" size="small" extra={extra}>
		// 	<Card title="事件区" size="small">
		// 		<NormalizedVectorTable tag="normalized"
		// 			data={normalized}
		// 			touchIndex={touchIndex}
		// 			onSelectRow={this.onSelectVectorItem.bind(this)}
		// 		/>
		// 	</Card>
		// );
	}

	render() {
		return (
			<div style={{minWidth:1000, backgroundColor:'white', padding:20}}>
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
