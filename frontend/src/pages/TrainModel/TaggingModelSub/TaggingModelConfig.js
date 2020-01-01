import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox, Collapse } from "antd";
import ElementComponent from '../../Template/ElementComponent';

let underscore = require("underscore");
let Immutable = require('immutable');
let moment = require('moment');
import debounce from 'lodash/debounce';

import styles from "../TrainModel.less";

export default class TaggingModelConfig extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.updateOne(props.item);
		this.searchSource = debounce(this.searchSource, 500);
	}

	componentWillReceiveProps(nextProps) {
		let isSame = Immutable.is(this.props.item, nextProps.item);
		if (isSame) {
			return;
		}
		let newState = this.updateOne(nextProps.item);
		this.setState(newState);
	}

	updateOne(item) {
		let newState = {
			word2vecDim: '120',
			source: '',
			sourceOpts: [],
			includeBase: true,
			epoch: '20',
		};
		if (item && Object.keys(item).length > 0) {
			newState = {
				word2vecDim: '120', // currently only 120, item.word2vecDim,
				source: item.source,
				sourceOpts: [{k:item.source, v:item.source}],
				includeBase: item.includeBase,
				epoch: item.epoch,
			};
		}
		return newState;
	}

	updateSource(data) {
		let x = [];
		for (let i=0; i<data.items.length; i++) {
			let curD = data.items[i];
			x.push({k:curD.tag, v:curD.tag});
		}
		this.setState({
			sourceOpts: x,
		});
	}

	searchSource(keyword) {
		if (!this.props.onQuery) {
			return;
		}
		let params = {
			payload: {
				type: 'tagging',
				page: 1,
				pageSize: 200,
				keyword: keyword,
				status: 'FINISHED',
			},
			callback: this.updateSource.bind(this),
		}
		this.props.onQuery('get-data-list', params);
	}

	isValidateContent() {
		const { word2vecDim, source, epoch } = this.state;
		let valid = true;
		let errMsg = [];
		if (!word2vecDim) {
			errMsg.push('词矢量维度');
		}
		if (!source) {
			errMsg.push('标注数据');
		}
		if (!epoch) {
			errMsg.push('循环次数');
		} else {
			let x = parseInt(epoch);
			if (isNaN(x)) {
				errMsg.push('循环次数');
			}
		}
		if (errMsg.length > 0) {
			valid = false;
		}
		return {
			valid: valid,
			errMsg: '请填写或选择' + errMsg.join(',')
		}
	}

	collect() {
		const { word2vecDim, source, includeBase, epoch } = this.state;
		let rst = this.isValidateContent();
		if (!rst.valid) {
			message.error(rst.errMsg);
			return null;
		}

		let x = {
			word2vecDim: word2vecDim,
			source: source,
			includeBase: includeBase,
			epoch: epoch,
		};
		return x;
	}

	render() {
		const { disabled } = this.props;
		const { sourceOpts, includeBase } = this.state;
		let lines = [
			{
				split: 12,
				items: [{
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'词矢量维度', tag:'word2vecDim', disabled:true,
					options: [{k:'100', v:'100'},{k:'120', v:'120'}]
				}, {
					layout: {title:6, element:16}, elementType:'input',
					title:'循环次数', tag:'epoch'
				}]
			},
			{
				split: 12,
				items: [{
					layout: {title:6, element:16}, elementType:'selectRemote',
					title:'标注数据', tag:'source', searchFunc: this.searchSource.bind(this),
					options:sourceOpts, disabled:disabled
				}]
			},
		];
		return (
			<Collapse bordered={false} defaultActiveKey={''}>
				<Collapse.Panel header="配置信息" key="1">
					{lines.map(this.renderLine.bind(this))}
					<Row>
						<Col span={12}>
							<Checkbox checked={includeBase}
								onChange={this.onChangeElement.bind(this, 'checkbox', 'includeBase')}>
								包含基本数据</Checkbox>
						</Col>
					</Row>
				</Collapse.Panel>
			</Collapse>
		);
	}
}
