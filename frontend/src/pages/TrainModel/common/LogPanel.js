import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
import { AutoSizer, List, CellMeasurerCache, CellMeasurer } from 'react-virtualized';
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "../TrainModel.less";
import 'react-virtualized/styles.css';

export default class LogPanel extends React.Component {
	static measureCache = new CellMeasurerCache({
		fixedWidth: true,
		minHeight: 28
	});

	constructor(props) {
		super(props);
		this.state = {
			scroll: 0,
			down: 0,
			index: 0,
			width: 200,
			height: 300,
		};
	}

	componentDidMount() {
		// TODO ???
	}

	rowRenderer({ index, key, parent, style }) {
		const { taskLogs } = this.props;
		// row的高度是不固定，采用CellMeasurer的方式，但是内部一定要加上style，不然滑动会出现问题
		let x = taskLogs[index];
		let ts = x.ts ? x.ts : '';
		return (
			<CellMeasurer
				cache={LogPanel.measureCache}
				columnIndex={0}
				key={key}
				parent={parent}
				rowIndex={index}
			>
				<div
					style={style}
					className={styles.listItem}
				>
					<span style={{color:'red'}}>{ts}</span>:
					<span style={{marginLeft:6}}>{x.content}</span>
				</div>
			</CellMeasurer>
		)
	}

	// 三个参数，显示的高度，总高度，距离顶部的位置
	handleScroll({ clientHeight, scrollHeight, scrollTop }) {
		this.setState({ scroll: scrollTop, down: scrollHeight - clientHeight });
	}

	handleTop() {
		this.setState({ scroll: 0 });
	}

	handleDown() {
		this.setState({ scroll: this.state.down + 2 });
	}


	render() {
		const { scroll, index } = this.state;
		const { taskLogs } = this.props;
		return (
			<div className={styles.cont}>
				<div className={styles.autoSizer}>
					{/* 如果AutoSizer被div元素包裹，父组件必须得有高度  */}
					<AutoSizer style={{height:400, width:'100%', resize:'both',overflow:'auto' }} >
						{({ height, width }) => (
							<List
								className={styles.ListBox}
								onScroll={this.handleScroll.bind(this)}
								scrollTop={scroll}
								scrollToIndex={index}
								overscanRowCount={5}
								/* 下面的属性必传 */
								height={height}  // list 组件的高度
								width={width} // list 组件的宽度
								deferredMeasurementCache={LogPanel.measureCache}
								rowHeight={LogPanel.measureCache.rowHeight} // 一列的高度
								rowCount={taskLogs.length}  // list总条数
								rowRenderer={this.rowRenderer.bind(this)}  // 渲染的list
							/>
						)}
					</AutoSizer>
				</div>

				<div style={{marginTop:10, textAlign:'center'}}>
					<Button onClick={this.handleTop.bind(this)} >顶部</Button>
					<Button onClick={this.handleDown.bind(this)} style={{marginLeft:6}}>底部</Button>
				</div>
			</div>
		);
	}
}
