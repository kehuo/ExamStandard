import React from 'react';
import { G2, Chart, Geom, Axis, Tooltip, Coord, Label,
	Legend, View, Guide, Shape, Facet, Util } from "bizcharts";
import DataSet from '@antv/data-set';
import numeral from 'numeral';

export class PieChart extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.data);
	}

	initData(data) {
		let dataA = [];
		let total = 0;
		for (let i=0; i<data.length; i++) {
			let curD = data[i];
			dataA.push({
				name: curD.name,
				cnt: curD.cnt,
				ratio: parseFloat(numeral(curD.ratio).format('0.000')),
			});
			total = total + curD.cnt;
		}
		let newState = {
			dv: dataA,
			total: total,
		};
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (JSON.stringify(this.props.data) == JSON.stringify(nextProps.data));
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps.data);
		this.setState(newState);
	}

	render() {
		const { Html } = Guide;
		const { height, width, centerTitle } = this.props;
		const { dv, total } = this.state;
		const cols = {
			ratio: {
				formatter: val => {
					val = val * 100 + "%";
					return val;
				}
			}
		};
		let centerContent = '<div style="color:#8c8c8c;font-size:1.16em;text-align: center;width: 10em">' + centerTitle + '<br><span style="color:#262626;font-size:2.5em">' + total + '</span>份</div>';
		return (
			<div style={{height:height, width:width}}>
				<Chart
					height={height}
					data={dv}
					scale={cols}
					padding={[0, 100, 80, 80]}
					forceFit
				>
					<Coord type={"theta"} radius={0.75} innerRadius={0.6} scale={[1.5,1.5]}/>
					<Axis name="ratio" />
					<Legend
						position="bottom"
					/>
					<Tooltip
						showTitle={false}
						itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
					/>
					<Guide>
						<Html
							position={["50%", "50%"]}
							html={centerContent}
							alignX="middle"
							alignY="middle"
						/>
					</Guide>
					<Geom
						type="intervalStack"
						position="ratio"
						color="name"
						tooltip={[
			              "name*ratio",
			              (name, ratio) => {
			                ratio = ratio * 100 + "%";
			                return {
			                  name: name,
			                  value: ratio
			                };
			              }
			            ]}
						style={{
			              lineWidth: 1,
			              stroke: "#fff"
			            }}
					>
						{/*<Label
							content="ratio"
							formatter={(val, item) => {
				                return item.point.name + ": " + val;
				            }}
						/>*/}
					</Geom>
				</Chart>
			</div>
		);
	}
}

export class LineChart extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props);
	}

	initData(props) {
		let ctags = props.ctags;
		let xtag = props.xtag;
		let ctagNames = props.ctagNames;
		let dataA = [];
		for (let i=0; i<props.data.length; i++) {
			let curD = props.data[i];
			let xVal = curD[xtag];
			for (let j=0; j<ctags.length; j++) {
				let ctag1 = ctags[j];
				let name = ctagNames[j];
				let yVal = curD[ctag1];
				if (!yVal) {
					yVal = 0;
				}
				dataA.push({
					x_tag: xVal,
					y_tag: yVal,
					c_tag: name
				});
			}
		}
		let newState = {
			data: dataA
		};
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (JSON.stringify(this.props.data) == JSON.stringify(nextProps.data));
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps);
		this.setState(newState);
	}

	render() {
		const { height, width } = this.props;
		const { data } = this.state;
		const cols = {
			x_tag: {
				range: [0, 1]
			}
		};
		return (
			<div style={{height:height, width:width, marginLeft:-20}}>
				<Chart height={height} data={data} scale={cols} forceFit>
					<Legend />
					<Axis name="x_tag" visible={false} />
					<Axis
						name="y_tag"
						label={{
                            formatter: val => `${val}`
			            }}
					/>
					<Tooltip
						crosshairs={{
			              type: "y"
			            }}
					/>
					<Geom
						type="line"
						position="x_tag*y_tag"
						size={2}
						color={"c_tag"}
						shape={"smooth"}
					/>
					<Geom
						type="point"
						position="x_tag*y_tag"
						size={4}
						shape={"circle"}
						color={"c_tag"}
						style={{
			              stroke: "#fff",
			              lineWidth: 1
			            }}
					/>
				</Chart>
			</div>
		);
	}
}