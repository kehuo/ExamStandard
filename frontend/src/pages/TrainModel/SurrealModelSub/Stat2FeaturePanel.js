import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Tooltip, message, Button, List, Card, Tree, Tag } from 'antd';
import { buildStatTreeData, buildDesignCfg } from './stat2featureUtils';
import FeatureDesignMiniPanel from './FeatureDesignMiniPanel';

import styles from '../TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ stat2Feature }) => ({
	stat2Feature
}))
export default class Stat2FeaturePanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			vType: 'exam',
			featureList: [],

			hotFeature: '',
			statTreeData: null,

			featureDesign: {}
		};
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'stat2Feature/fetch',
			payload: '',    //TODO
			callback: this.filterFeatureList.bind(this, '')
		});
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		}
		curState[tag] = realVal;

		let callback = null;
		if (tag == 'vType') {
			callback = this.filterFeatureList.bind(this,  '');
		}
		this.setState(curState, callback);
	}

	filterFeatureList(keyword) {
		const { featuresListMap } = this.props.stat2Feature;
		const { vType } = this.state;
		let featureListType = featuresListMap[vType];
		let featureList = featureListType;
		if (keyword) {
			featureList = [];
			for (let i=0; i<featureListType.length; i++) {
				let curF = featureListType[i];
				if (curF.indexOf(keyword) != -1) {
					featureList.push(curF);
				}
			}
		}
		this.setState({
			featureList: featureList,
		});
	}

	onSelectFeatureOne(text) {
		const { statistics } = this.props.stat2Feature;
		const { vType } = this.state;
		let feature = text + '$' + vType;

		let statTreeData = null;
		if (statistics[vType] && statistics[vType][feature]) {
			statTreeData = buildStatTreeData(statistics, vType, feature);
		}

		let featureDesign = this.state.featureDesign;
		if (!featureDesign[feature]) {
			let x = buildDesignCfg(statistics, vType, feature);
			featureDesign[feature] = x;
		}
		this.setState({
			hotFeature: text,
			statTreeData: statTreeData,
			featureDesign: featureDesign,
		});
	}

	buildFeatureOne(maxLength, item) {
		let fields = item.split('$');
		let text = fields[0];

		let component = text;
		if (text.length > maxLength) {
			let showText = text.substring(0, maxLength-2) + '...';
			component = (
				<Tooltip title={text}>
					{showText}
				</Tooltip>
			);
		}
		return (
			<List.Item>
				<span onClick={this.onSelectFeatureOne.bind(this, text)}>{component}</span>
			</List.Item>
		);
	}

	buildFeatureList() {
		const { vType, featureList } = this.state;
		const VectorTypeOpts = [
			{k:'检查', v:'exam'},{k:'症状', v:'symptom'},{k:'疾病', v:'disease'},
			{k:'治疗', v:'treatment'},{k:'药物', v:'medicine'},
		];
		return (
			<Card title="特征列表" size="small">
				<Row>
					<Col span={6} style={{textAlign:'right'}}>类型:</Col>
					<Col span={16} style={{marginLeft:6}}>
						<Select style={{width:'100%'}}
						        value={vType}
						        defaultActiveFirstOption={false}
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChangeElement.bind(this, 'select', 'vType')}
						>
							{VectorTypeOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginTop:12}}>
					<Input.Search placeholder="输入关键字"
					              onSearch={this.filterFeatureList.bind(this)} enterButton />
				</Row>
				<Row style={{marginTop:12, height:600, overflowY:'auto'}}>
					<List size="small" bordered
					      dataSource={featureList}
					      renderItem={this.buildFeatureOne.bind(this, 12)}
					/>
				</Row>
			</Card>
		);
	}

	buildNameTag(vType, hotFeature) {
		const TypeColorMap = {
			exam:'green', symptom:'magenta', disease:'geekblue',
			treatment:'volcano', medicine:'purple'
		};
		if (!hotFeature) {
			return null;
		}

		let color = TypeColorMap[vType];
		if (!color) {
			color = '#f50';
		}

		let text = hotFeature;
		let component = text;
		if (text.length > 30) {
			let showText = fields[0].substring(0, 30-2) + '...';
			component = (
				<Tooltip title={text}>
					{showText}
				</Tooltip>
			);
		}
		return (
			<Tag color={color}>{component}</Tag>
		);
	}

	buildFeatureStat() {
		const { vType, hotFeature, statTreeData } = this.state;
		let nameComp = this.buildNameTag(vType, hotFeature);
		let dataComp = '暂不数据';
		if (hotFeature && statTreeData) {
			dataComp = (
				<Tree showLine
				      treeData={statTreeData}
				/>
			);
		}
		return (
			<Card title="特征统计信息" size="small">
				<Row>{nameComp}</Row>
				{dataComp}
			</Card>
		);
	}

	updateFeatureDesign(feature, x) {
		let featureDesign = this.state.featureDesign;
		featureDesign[feature] = JSON.parse(x);
		this.setState({
			featureDesign: featureDesign,
		});
	}

	buildFeatureDesign() {
		const { vType, hotFeature, featureDesign } = this.state;
		let feature = hotFeature + '$' + vType;
		let curF = featureDesign[feature];
		return (
			<FeatureDesignMiniPanel
				vType = {vType}
				text = {hotFeature}
			    item={curF}
			    onSubmit={this.updateFeatureDesign.bind(this)}
			/>
		);
	}

	render() {
		return (
			<Row gutter={16} style={{minWidth:1000, margin:'auto', backgroundColor:'white', padding:10}}>
				<Col span={6}>
					{this.buildFeatureList()}
				</Col>
				<Col span={9}>
					{this.buildFeatureStat()}
				</Col>
				<Col span={9}>
					{this.buildFeatureDesign()}
				</Col>
			</Row>
		)
	}
}
