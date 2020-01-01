import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Card, Divider, message, Button, Tabs } from 'antd';
import _ from 'lodash';
import ReactEcharts from 'echarts-for-react';
import DemoBar from './DemoBar';
import { buildOptionsByTags } from '@/utils/utils';


import styles from './Demo.less';
import {routerRedux} from 'dva/router';
@connect(({ gfyDemo }) => ({
    gfyDemo,
}))
export default class DemoGfyDistributionPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {

		};
	}

	componentDidMount() {
        const { dispatch, gfyDemo: { top } } = this.props;
		dispatch({
            type: 'gfyDemo/fetch',
            payload: {
                top,
            },
		});
    }

    onChangeExperiment = (val) => {
        const { dispatch, gfyDemo: { top } } = this.props;
        if (!val || isNaN(val)) {
            return;
        }
		dispatch({
            type: 'gfyDemo/fetchExperiment',
            payload: {
                id: parseInt(val),
                top,
            },
		});
    }

    buildBarOption = (datum) => {
        let rst = [];
        _.map(datum, (o) => {
            rst.push({
                x: JSON.stringify({
                    code: o.code,
                    name: o.name,
                    short_name: o.short_name,
                }),
                y: Qn(o.ratio, 4),
            })
        });
        return rst;
    }
    
    buildSearchBar() {
		const { gfyDemo: { experimentList, experiment } } = this.props;
		return (
			<Card title="选择实验数据">
                <Row style={{marginBottom:6}}>
                    <Col span={3} style={{textAlign:'right'}}>实验数据:</Col>
                    <Col span={8} style={{marginLeft:6}}>
                        <Select style={{width:'100%'}}
                                value={experiment.id ? experiment.id.toString() : ''}
                                defaultActiveFirstOption={false}
                                showArrow={true}
                                filterOption={false}
                                onChange={this.onChangeExperiment}
                        >
                            {experimentList.map( o=> <Select.Option key={o.id.toString()}>{o.name}</Select.Option>)}
                        </Select>
                    </Col>
                </Row>
			</Card>
		);
    }

    // 获取点的坐标信息
    // data: 数据信息
    // count: 点的总数
    // index: 序号
    getPopChartPoint = (count, index, r1, r2, offset = 0) => {
        let x = Math.sin((2*Math.PI/360) * (360/count) * index + offset) * (r1 - r2);
        let y = Math.cos((2*Math.PI/360) * (360/count) * index + offset) * (r1 - r2);
        return { x, y };
    }

    getPopChartPoint2 = (sumWeight, curWeight, r1, r2, offset = 0) => {
        let x = Math.sin((2*Math.PI/360) * (360 / sumWeight) * curWeight + offset) * (r1 - r2);
        let y = Math.cos((2*Math.PI/360) * (360 / sumWeight) * curWeight + offset) * (r1 - r2);
        return { x, y };
    }

    buildEchartOption = (data) => {
        let unitSymbolSize = 60;
        let minSymbolSize = 10;
        let items = [{
            id: 'main',
            name: '异位妊娠',
            symbolSize: unitSymbolSize,
            emphasisName: '异位妊娠',
            itemStyle: {
                normal: {
                    // color: '#1890FF',
                    color: '#66CC66',
                }
            },
            x: 0,
            y: 0,
        }];
        let edges = [];
        data = _.filter(data, (o) => { return o.weight > 0; });
        let maxWeightObj = _.maxBy(data, function(o) { return o.weight; });
        let maxWeight = maxWeightObj.weight || 1;
        for (let i = 0 ; i < data.length; i++) {
            data[i].angleWeight = data[i].weight < maxWeight / 2 ? maxWeight / 2 : data[i].weight;
        }
        let sumWeight = _.sumBy(data, function(o) { return o.angleWeight; });
        data = _.shuffle(data);
        let offset = _.random(0, 90, true);
        let curWeight = 0; 
        for (let i = 0 ; i < data.length; i++) {
            let symbolSize = data[i].weight * unitSymbolSize / maxWeight;
            symbolSize = Math.max(symbolSize, minSymbolSize);
            curWeight += i > 0 ? (data[i].angleWeight + data[i - 1].angleWeight) / 2 : 0;
            // let point = this.getPopChartPoint(data.length, i, 280, symbolSize / 2, offset);
            let point = this.getPopChartPoint2(sumWeight, curWeight, 280, symbolSize / 2, offset);
            items.push({
                id: data[i].code,   // code,
                name: data[i].short_name, // show name,
                symbolSize: symbolSize,
                emphasisName: data[i].name,
                itemStyle: {
                    normal: {
                        color: '#1890FF',
                    }
                },
                x: point.x,
                y: point.y,
            });
            edges.push({
                target: data[i].code, 
                source: 'main',
                lineStyle: {
                    normal: {
                        width: 1,
                        
                    }
                }
            });
        }
        let option = {
            series: [
                {
                    type: 'graph',
                    // layout: 'force',
                    // force: {
                    //     repulsion: 220,
                    //     edgeLength: [50, 320],
                    // },
                    data: items,
                    edges: edges,
                    label: {
                        normal: {
                            position: 'right',
                            show: true,
                        },
                        emphasis: {
                            position: 'top',
                            color: 'red',
                            show: true,
                            formatter: (params) => {
                                return params.data.emphasisName;
                            }
                        }
                    },
                    lineStyle: {
                        normal: {
                            width: 1,
                        }
                    },
                    draggable: true,
                }
            ]
        };
        return option;
    }

    // buildEchartOption2 = (data) => {
    //     let items = [{
    //         id: 'main',
    //         name: '异位妊娠',
    //         symbolSize: 80,
    //         emphasisName: '异位妊娠',
    //         itemStyle: {
    //             normal: {
    //                 // color: '#1890FF',
    //                 color: '#66CC66',
    //             }
    //         }
    //     }];
    //     let edges = [];
    //     let maxWeightObj = _.maxBy(data, function(o) { return o.weight; });
    //     let maxWeight = maxWeightObj.weight || 1;
    //     for (let i = 0 ; i < data.length; i++) {
    //         items.push({
    //             id: data[i].code,   // code,
    //             name: data[i].short_name, // show name,
    //             symbolSize: data[i].weight * 100 / maxWeight,
    //             emphasisName: data[i].name,
    //             itemStyle: {
    //                 normal: {
    //                     color: '#1890FF',
    //                 }
    //             },
    //         });
    //         edges.push({
    //             target: data[i].code, 
    //             source: 'main',
    //             lineStyle: {
    //                 normal: {
    //                     width: 1,
                        
    //                 }
    //             }
    //         });
    //     }
    //     let option = {
    //         series: [
    //             {
    //                 type: 'graph',
    //                 layout: 'force',
    //                 force: {
    //                     repulsion: 220,
    //                     edgeLength: [50, 320],
    //                 },
    //                 data: items,
    //                 edges: edges,
    //                 label: {
    //                     normal: {
    //                         position: 'inside',
    //                         show: true,
    //                     },
    //                     emphasis: {
    //                         position: 'inside',
    //                         show: true,
    //                         formatter: (params) => {
    //                             return params.data.emphasisName;
    //                         }
    //                     }
    //                 },
    //                 lineStyle: {
    //                     normal: {
    //                         width: 1,
    //                     }
    //                 },
    //                 draggable: true,
    //             }
    //         ]
    //     }
    //     return option;
    // }

    buildDistributionBarChart() {
        const { gfyDemo: { experiment }} = this.props;
        let dataList = [];
        if (experiment.content) {
            dataList = this.buildBarOption(experiment.content.positiveDistribution);
        }
        return (
            <DemoBar
                height={480}
                data={dataList}
                axisXFormatter={{
                    rotate: 60,
                    formatter: (o) => {
                        // console.log('item', text, item, index);
                        return  JSON.parse(o).short_name;
                    },
                    // autoRotate: false,
                }}
                axisYFormatter={{
                    formatter: (o) => {
                        // console.log('item', text, item, index);
                        // return  `${parseFloat(o * 100, 2)}%`;
                        return  `${(o * 100).toFixed(2)}%`;
                    },
                }}
            />
        )
    }

    buildWeightsPopChart() {
        const { gfyDemo: { experiment }} = this.props;
        let option = {};
        if (experiment.content) {
            option = this.buildEchartOption(experiment.content.entity);
        }
        return (
            <div style={{width: '100%', height: 480}}>
                <ReactEcharts
                    option={option}
                    notMerge={true}
                    lazyUpdate={true}
                    // theme={"theme_name"}
                    // onChartReady={this.onChartReadyCallback}
                    // onEvents={EventsDict}
                    // opts={}
                    style={{height: 480}}
                />
            </div>
        )
    }
    
    buildCharts() {
        return (
            <Row gutter={8}>
				<Col span={12}>
					<Card title="分布图">
                        {this.buildDistributionBarChart()}
					</Card>
				</Col>
				<Col span={12}>
					<Card title="权重图" >
                        {this.buildWeightsPopChart()}
					</Card>
				</Col>
			</Row>
        );
    }

	render() {
		return (
			<div style={{minWidth: 1000}}>
				{this.buildSearchBar()}
				{this.buildCharts()}
			</div>
		);
	}
}

function Qn(x, qn=2) {
    let scale = Math.pow(10, qn);
    let y = Math.floor(x * scale) / scale;
    return y;
}
