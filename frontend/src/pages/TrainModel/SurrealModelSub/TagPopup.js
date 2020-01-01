import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Tooltip, message, Button, Tabs, Popconfirm, Modal } from 'antd';
import * as Const from './FeatureConstants';
import ElementComponent from '../../Template/ElementComponent';

import styles from '../TrainModel.less';
let underscore = require('underscore');
import debounce from "lodash/debounce";

function makeTagsShow(tags) {
	let tagsShow = [];
	let tagShowOpts = [];
	for (let i=0; i<tags.length; i++) {
		// {"display": "身体部位", "name": "bodyObj"}
		let curTag = tags[i];
		tagsShow.push(curTag.name);
		tagShowOpts.push({k:curTag.display, v:curTag.name});
	}
	let rst = {
		tagsShow: tagsShow,
		tagShowOpts: tagShowOpts,
	};
	return rst;
}

export default class TagPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(null);
		this.queryVector = debounce(this.queryVector, 500);
	}

	initData(item) {
		let newState = {
			type: '',
			text: '',
			code: '',
			vectorOpts: [],

			tagsShow: [],
			tagShowOpts: [],
			createNew: true,
		};
		if (item) {
			newState.createNew = false;
			newState.type = item.type;

			newState.text = item.text;
			newState.code = item.code ? item.code : item.text;
			newState.vectorOpts = [{k:newState.text, v:newState.code}];

			if (item.tags && item.tags.length>0) {
				let rst = makeTagsShow(item.tags);
				newState.tagsShow = rst.tagsShow;
				newState.tagShowOpts = rst.tagShowOpts;
			}
		}
		return newState;
	}

	componentDidMount() {
		const { item } = this.props;
		if (item) {
			// re-update extension list for later edit
			this.queryExtension();
		}
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps.item);
		let callback = this.queryExtension.bind(this);
		this.setState(newState, callback);
	}

	onChangeElement(elementType, tag, val, option) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		}
		let callback = null;
		if (tag == 'code') {
			curState.text = option.props.children;
			curState.tagsShow = [];
			callback = this.queryExtension.bind(this)
		}
		curState[tag] = realVal;
		this.setState(curState, callback);
	}

	queryVector(keyword) {
		const { type } = this.state;
		if (!type) {
			message.error('请先选择矢量类型!')
			return;
		}
		if (!keyword) {
			return;
		}

		let params = {
			type: type,
			dataType: 'mapping',
			keyword: keyword,
			page: 1,
			pageSize: 1000,
		};
		this.props.onQuery('vector', params, this.updateVectorOpts.bind(this));
	}

	updateVectorOpts(data) {
		let vectorOpts = [];
		for (let i=0; i<data.length; i++) {
			let curD = data[i];
			vectorOpts.push({
				k: curD.name,
				v: curD.code
			});
		}
		this.setState({
			vectorOpts: vectorOpts
		});
	}

	queryExtension() {
		const { type, text, code} = this.state;
		if (!type || !text) {
			return;
		}

		let params = {
			type: type,
			dataType: 'mapping',
			keyword: text,
			code: code,
			page: 1,
			pageSize: 1000,
		};
		this.props.onQuery('extension', params, this.updateExtensionOpts.bind(this));
	}

	updateExtensionOpts(data) {
		const { type } = this.state;
		let tagShowOpts = [];
		if (type == 'symptom') {
			tagShowOpts.push({k:'身体部位',v:'bodyObj'});
		}
		for (let i=0; i<data.length; i++) {
			let curD = JSON.parse(JSON.stringify(data[i]));
			if (curD.name.indexOf('正则') != -1) {
				continue;
			}
			curD.k = curD.name;
			curD.v = curD.code;
			tagShowOpts.push(curD);
		}
		this.setState({
			tagShowOpts: tagShowOpts,
		});
	}

	isValidContent() {
		const { type, text, code} = this.state;
		let rst = {
			ok: true, msg: ''
		};
		if (!type || !text) {
			rst.ok = false;
			rst.msg = '请选择类型和名称';
		}
		return rst;
	}

	onSubmit(isUpdate) {
		const { type, text, code, tagsShow, tagShowOpts} = this.state;
		let x = null;
		if (isUpdate) {
			let rst = this.isValidContent();
			if (!rst.ok) {
				message.error(rst.msg);
				return;
			}

			x = {
				type: type,
				text: text,
				code: code,
			};
			if (tagsShow.length > 0) {
				let tags = [];
				for (let i=0; i<tagShowOpts.length; i++) {
					let curTagShow = tagShowOpts[i];
					if (tagsShow.indexOf(curTagShow.v) != -1) {
						let y = {
							name: curTagShow.v,
							display: curTagShow.k,
						};
						if (curTagShow.props) {
							let enumsX = [];
							for (let j=0; j<curTagShow.props.length; j++) {
								let curP = curTagShow.props[j];
								enumsX.push(curP.name);
							}
							y.enums = enumsX;
						}
						tags.push(y);
					}
				}
				if (tags.length > 0) {
					x.tags = tags;
				}
			}
		}
		this.props.onSubmit(isUpdate, x);
	}

	render() {
		const { visible, item, mode } = this.props;
		const { vectorOpts, tagShowOpts, createNew } = this.state;
		const extLines = [
			{
				split: 24,
				items: [{
					layout: {title: 4, element: 16}, elementType: 'selectMultiple',
					title: '扩展', tag: 'tagsShow', options: tagShowOpts
				}]
			},
		];
		let Lines = [
			{
				split: 24,
				items: [{
					layout: {title: 4, element: 16}, elementType: 'selectSimple',
					title: '矢量类型', tag: 'type', disabled: !createNew,
					options: Const.VectorTypeOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 4, element: 16}, elementType: 'selectRemote',
					title: '矢量名称', tag: 'code', disabled: !createNew,
					searchFunc: this.queryVector.bind(this),
					options: vectorOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 4, element: 16}, elementType: 'label',
					title: '矢量代码', tag: 'code', disabled: !createNew,
				}]
			},
		];
		let title = '添加';
		if (item) {
			title = '编辑';
		}

		if (!mode) {
			return null;
		}

		return (
			<Modal visible={visible} title={title} closable={false}
			       onOk={this.onSubmit.bind(this, true)}
			       onCancel={this.onSubmit.bind(this, false)}
			>
				{Lines.map(this.renderLine.bind(this))}
				{mode == 'oneHot' && extLines.map(this.renderLine.bind(this))}
			</Modal>
		);
	}
}