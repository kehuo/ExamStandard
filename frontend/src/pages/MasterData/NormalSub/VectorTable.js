import React, { Component, PropTypes } from 'react';
import { Card, Button, Row, Col, Tabs, Popover, Icon, Table, Input, Select, message } from 'antd';

var Immutable = require('immutable');
var _ = require('underscore');

export default class VectorTable extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = this.initData(props);
	}
	
	onSelectRow(index) {
		const { tableBody } = this.state;
		if (this.props.onSelectRow) {
			let entityOne = tableBody[index];
			this.props.onSelectRow(entityOne);
		}
	}

	textRender(props, text, record, index) {
		let buildSourceStr = function (source) {
			let sourceStr ='文本描述';
			if (source === 'exam') {
				sourceStr = '检查结果'
			} else if (source === 'pathogen') {
				sourceStr = '诱因'
			}
			return sourceStr
		};
		let items = [];
		let medicineItems = [];
		let descs = (record['misc'] && record['misc']['deco']) ? record['misc']['deco']: [];
		descs.map(desc => {
			items.push(desc[3])
		});
		let dispStr = (items.length > 0) ? items.join(',') : '无修饰';
		let sourceStr = buildSourceStr(record['source']);

		let medicines = (record['misc'] && record['misc']['medicine']) ? record['misc']['medicine']: [];

		medicines.map(medicine => {
			let mItem = medicine['text'];
			let mdescs = (medicine['misc'] && medicine['misc']['deco']) ? medicine['misc']['deco']: [];
			let mdescItems = [];
			mdescs.map(mdesc => {
				mdescItems.push(mdesc[3])
			});
			if (mdescItems.length > 0) {
				mItem = mItem + '(' + mdescItems.join(',') + ')'
			}
			medicineItems.push(mItem)
		});

		let medicineStr = (medicineItems.length > 0) ? medicineItems.join(',') : '';

		let addition = [];
		if (record['addition'] && props.tag==='normalized') {
			let keys=_.keys(record['addition']);
			keys.map((key,i) => {
				let item = key + ':';
				record['addition'][key].map(rec => {
					item += rec['text'];
					if (rec['negative']===0) {
						item += '(无)'
					}
					item += '[' + rec['code'] + '].'
				});
				addition.push(item)
			})
		}

		let realValue = '';
		if (record['type'] === 'exam') {
			if (record.hasOwnProperty('realValue') && typeof(record['realValue']) === 'object') {
				realValue = JSON.stringify(record['realValue'])
			} else if (record.hasOwnProperty('realValue')) {
				realValue = record['realValue']
			}
		}

		let dispComp = (
			<div>
				<p>矢量来源：{sourceStr}</p>
				<p>矢量修饰：{dispStr}</p>
				<p>{(medicineStr !== '') && '治疗药物：' + medicineStr}</p>
				{(props.tag==='normalized' && addition.length > 0) &&
				<p>
					附加规范信息：
					{addition.map(item =>
						<li> {item} </li>
					)}
				</p>
				}
				{(props.tag==='normalized' && record['type'] === 'exam') &&
				<p>
					检查值: {realValue}
				</p>
				}
				{(props.tag==='normalized' && record.hasOwnProperty('misc') && record.misc.hasOwnProperty('tags')) &&
				<p>
					原标签:
					{record.misc.tags.map(tag =>
						<b> {tag[3]} </b>
					)}
				</p>
				}
			</div>
		);

		return (
			<div onClick={this.onSelectRow.bind(this, index)}>
				<Popover content={dispComp} title="附加信息">
					{(record.hasOwnProperty('deduced') ) &&
					<Icon style={{display:'inline-block',color:'red'}} type="bulb" />}
					<label style={{display:'inline-block', cursor:'pointer', wordWrap: 'break-word', wordBreak: 'break-all' }}>{text}</label>
				</Popover>
			</div>
		);
	};

	initData(props) {
		// let sameRender = function (text, record) {
		// 	if (text == 0) {
		// 		return null;
		// 	}
		// 	return (
		// 		<div style={{color:'red',fontSize:24}}><Icon type="smile"/></div>
		// 	);
		// };

		let timeRender = function (text, record) {
			if (text.startsWith('A')) {
				let fields = text.split('/');
				let displayStr = '';
				for (let i=0; i<fields.length; i++) {
					let curF = fields[i];
					let lastChar = curF[curF.length-1];
					let unit = '';
					switch (lastChar) {
						case 'Y': unit = '岁'; break;
						case 'M': unit = '个月'; break;
						default: break;
					}
					let numberStr = curF.substring(1, curF.length-1);
					displayStr += numberStr + unit;
				}
				return displayStr;
			} else {
				let fields = text.split('/');
				if (fields.length != 2) {
					return text;
				}
				let comp = (
					<span>从{fields[0]}<br/>至{fields[1]}</span>
				);
				return comp;
			}
			return text;
		};

		let typeRender = function (text, record) {
			let displayText = text;
			if (record['type'] === 'disease' && record['source'] === 'pathogen') {
				displayText += '[诱因]'
			}
			return displayText
		};


		let tableHead = [];
		// if (props.useSame) {
		// 	tableHead.push({title: '相同', dataIndex: 'same', render:sameRender});
		// }
		let tableHead4 = [
			{title: '类型', dataIndex: 'type', render:typeRender,
			// sorter 排序 
				sorter: (a, b) => (a.type).localeCompare(b.type)},
			{title: '名称', dataIndex: 'text', render: this.textRender.bind(this, props),
				sorter: (a, b) => (a.text).localeCompare(b.text)},
			{title: '取值', dataIndex: 'value', width:'15%',
				sorter: (a, b) => (''+a.value).localeCompare(''+b.value)},
			// {title: '时间', dataIndex: 'time', render:timeRender,
			// 	sorter: (a, b) => (a.time).localeCompare(b.time)},
		];
		tableHead = tableHead.concat(tableHead4);
		if (props.tag === 'normalized') {
			tableHead.push({title: '规范化', dataIndex: 'normalization', width:'15%'})
			// tableHead.push({title: 'HPO', dataIndex: 'misc', render:hpoRender})
		}

		let tableBody = props.data;     //props.data, mockInput()
		if (props.touchIndex != -1) {
			tableBody = this.filterDataByPosition(tableBody, props.touchIndex);
		}
		return {
			tableHead: tableHead,
			tableBody: tableBody
		};
	}

	filterDataByPosition(datum, touchIndex) {
		let rst = [];
		for (let i=0; i<datum.length; i++) {
			let curData = datum[i];
			if (!curData.misc) {
				// some deduced vectors ???
				continue;
			}
			let tags = curData.misc.tags;
			if (!tags) {
				// some deduced vectors ???
				continue;
			}
			let found = false;
			for (let i=0; i<tags.length; i++) {
				let curTag = tags[i];
				if (curTag[0] <= touchIndex && curTag[1] >= touchIndex) {
					found = true;
					break;
				}
			}
			if (found) {
				rst.push(curData);
			}
		}
		return rst;
	}

	// 更新数据
	componentWillReceiveProps(nextProps) {
		// Immutable.IS 用来比较2个数据是否发生变化
		var sameProps = Immutable.is(this.props, nextProps);
		if (!sameProps) {
			var newState = this.initData(nextProps);
			this.setState(newState);
		}
	}

	render() {
		const { tableHead, tableBody } = this.state;
		return (
			<Table id={'vectorList'} size="small"
			       columns={tableHead}
			       dataSource={tableBody}
			       pagination={false}
			/>
		);
	}
}
