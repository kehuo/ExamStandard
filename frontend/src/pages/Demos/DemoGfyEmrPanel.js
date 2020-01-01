import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import _ from 'lodash';
import { Row, Col, Input, Select, Icon, Card, Divider, message, Button, Tabs, Form, Spin } from 'antd';
import ReactEcharts from 'echarts-for-react';
import Bar from '../../components/Charts/Bar';
import { buildOptionsByTags } from '@/utils/utils';

import styles from './Demo.less';
import {routerRedux} from 'dva/router';

const topDisplay = 30;
const FormItem = Form.Item;

@Form.create()
@connect(({ gfyDemo, loading }) => ({
    gfyDemo,
    loading: loading.models.gfyDemo,
}))
export default class DemoGfyEmrPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
            exams: [],
            id: '',
		};
	}

	componentDidMount() {
        const { dispatch, gfyDemo: { top } } = this.props;
        dispatch({
            type: 'gfyDemo/fetch',
            payload: {
                topDisplay, //top,
            },
		});
		dispatch({
            type: 'gfyDemo/fetchEmrList',
        });
        // dispatch({
        //     type: 'gfyDemo/clearDiagnosis',
        // })
    }

    _dataHash = '';

    checkAge = (rule, value, callback) => {
        const rgx = /^\d+$/ig;
        if (!rgx.test(value)) {
            callback("请输入正确的年龄");
        }
        callback();
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
                topDisplay, // top,
            },
		});
    }

    onChangeEmr = (val) => {
        const { dispatch, gfyDemo: { top } } = this.props;
        if (!val || isNaN(val)) {
            return;
        }
		dispatch({
            type: 'gfyDemo/fetchEmr',
            id: parseInt(val),
            callback: (res) => {
                this.fullEmrInfo(res);
            }
        });
        dispatch({
            type: 'gfyDemo/clearDiagnosis',
        });
    }

    fullEmrInfo = (emr) => {
        const { form } = this.props;
        form.setFieldsValue({
            age: emr.age.toString(),
            complaint: emr.complaint,
            present: emr.present,
            past: emr.past || '无',
            allergy: emr.allergy || '无',
            family: emr.family || '无',
            childbearing: emr.childbearing || '无',
            menstrual: emr.menstrual || '无',
            physical: emr.physical || '无',
        });

        let exams = [];
        if (emr.exam) {
            exams = JSON.parse(emr.exam);
        }
        this.setState({
            exams: exams,
            id: emr.id
        });
    }

    onSubmit = () => {
        const { form, gfyDemo: { experiment, top } } = this.props;
        const { id } = this.state;
        form.validateFields((err, fieldsValue) => {
            if (err) {
                return null;
            }
            this.onPredictDiagnosis({
                ...fieldsValue,
                exId: experiment.id,
                topN: topDisplay, // top,
                visitAt: moment().format('YYYY-MM-DD'),
                tag: 'gfy',
                gender: 'F',
                id: id,
            });
        });
    }

    onPredictDiagnosis = (emr) => {
        const { dispatch } = this.props;
        dispatch ({
            type: 'gfyDemo/predictDiagnosis',
            payload: emr,
        });
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

    // buildDistributionBarChart() {
    //     const { gfyDemo: { experiment }} = this.props;
    //     let dataList = [];
    //     if (experiment.content) {
    //         dataList = buildOptionsByTags(experiment.content.positiveDistribution, 'code', 'ratio', 'x', 'y', true);
    //     }
    //
    //     return (
    //         <Bar
    //             height={480}
    //             data={dataList}
    //         />
    //     )
    // }

    buildWeightsPopChart() {
        const { gfyDemo: { diagnosis }} = this.props;
        let option = {};
        if (diagnosis && !_.isEmpty(diagnosis.features)) {
            let dataHash = JSON.stringify(diagnosis.features);
            if (this._dataHash !== dataHash) {
                this._dataHash = dataHash
                option = this.buildEchartOption(diagnosis.features);
            }
        }
        return (
            <div style={{width: '100%', height: 480}}>
                <ReactEcharts
                    option={option}
                    // notMerge={true}
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

     // 获取点的坐标信息
    // data: 数据信息
    // count: 点的总数
    // index: 序号
    // getPopChartPoint = (count, index, r1, r2, offset = 0) => {
    //     let x = Math.sin((2*Math.PI/360) * (360 / count) * index + offset) * (r1 - r2);
    //     let y = Math.cos((2*Math.PI/360) * (360 / count) * index + offset) * (r1 - r2);
    //     return { x, y };
    // }

    getPopChartPoint2 = (sumWeight, curWeight, r1, r2, offset = 0) => {
        let x = Math.sin((2*Math.PI/360) * (360 / sumWeight) * curWeight + offset) * (r1 - r2);
        let y = Math.cos((2*Math.PI/360) * (360 / sumWeight) * curWeight + offset) * (r1 - r2);
        return { x, y };
    }

    buildEchartOption = (data) => {
        let unitSymbolSize = 60;
        let minSymbolSize = 10;
        let minWeight = 0.0001;
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
        // data = _.filter(data, (o) => { return o.weight > 0; });
        let maxWeightObj = _.maxBy(data, function(o) { return o.weight; });
        let maxWeight = maxWeightObj.weight || 1;
        for (let i = 0 ; i < data.length; i++) {
            let curW = Math.max(data[i].weight, minWeight);
            data[i].angleWeight = curW < maxWeight / 2 ? maxWeight / 2 : curW;
            // data[i].angleWeight = data[i].weight < maxWeight / 2 ? maxWeight / 2 : data[i].weight;
        }
        let sumWeight = _.sumBy(data, function(o) { return o.angleWeight; });
        data = _.shuffle(data);
        let offset = _.random(0, 90, true);
        let curWeight = 0; 
        for (let i = 0 ; i < data.length; i++) {
            let curW = Math.max(data[i].weight, minWeight);
            let symbolSize = curW * unitSymbolSize / maxWeight;
            // let symbolSize = data[i].weight * unitSymbolSize / maxWeight;
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

    // buildEchartOption = (data) => {
    //     let items = [{
    //         id: 'main',
    //         name: '异位妊娠',
    //         symbolSize: 80,
    //         emphasisName: '异位妊娠',
    //         itemStyle: {
    //             normal: {
    //                 color: '#66CC66',
    //                 // color: '#1890FF',
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
    //                 // normal: {
    //                 //     color: data[i].match ? '#1890FF' : '#ccc',
    //                 // }
    //                 normal: {
    //                     color: '#1890FF',
    //                 }
    //             }
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

    // buildDistributionBarChart() {
    //     const { gfyDemo: { experiment }} = this.props;
    //     let dataList = [];
    //     if (experiment.content) {
    //         dataList = buildOptionsByTags(experiment.content.positiveDistribution, 'code', 'ratio', 'x', 'y', true);
    //     }
    //
    //     return (
    //         <Bar
    //             height={480}
    //             data={dataList}
    //         />
    //     );
    // }

    buildNoticeBar() {
        let { gfyDemo: { diagnosis }} = this.props;
        let rst0 = null;
        if (diagnosis && diagnosis.notification) {
            if (diagnosis.notification.serious) {
                rst0 = (<div className={styles.diagnoseNotice}>
                    不含化验指标 <Icon type="warning" style={{ fontSize: '16px', color: 'red', marginRight: 8 }}/>
                    <span>{`存在${diagnosis.notification.diagnosis || '异位妊娠'}风险(${Math.round(diagnosis.notification.probability * 100)}%)`}</span>
                </div>);
            } else {
                rst0 = (<div className={styles.diagnoseNotice}>
                    不含化验指标 <Icon type="check-circle" style={{ fontSize: '16px', color: '#52c41a', marginRight: 8 }}/>
                    <span>无异位妊娠风险</span>
                </div>);
            }
        }

        let rst1 = null;
        // if (diagnosis && diagnosis.exam_rst && diagnosis.exam_rst.notification) {
        //     let notification = diagnosis.exam_rst.notification;
        //     if (notification.serious) {
        //         rst1 = (<div className={styles.diagnoseNotice}>
        //             包含化验指标 <Icon type="warning" style={{ fontSize: '16px', color: 'red', marginRight: 8 }}/>
        //             <span>{`存在${diagnosis.notification.diagnosis || '异位妊娠'}风险(${Math.round(notification.probability * 100)}%)`}</span>
        //         </div>);
        //     } else {
        //         rst1 = (<div className={styles.diagnoseNotice}>
        //             包含化验指标 <Icon type="check-circle" style={{ fontSize: '16px', color: '#52c41a', marginRight: 8 }}/>
        //             <span>无异位妊娠风险</span>
        //         </div>);
        //     }
        // }

        let rst = (
            <div>
                {rst0}
                {rst1}
            </div>
        )
        return rst;
    }

    buildEmrForm() {
        let { gfyDemo: { emrList, emr }, form } = this.props;
        return (
            <Form style={{ width: '100%', margin: '0 auto' }}>
                <FormItem labelCol={{ span: 5}} wrapperCol={{ span: 17 }} label="年龄">
                    {form.getFieldDecorator('age', {
                        rules: [{
                            required: true, whitespace: true, message: "请输入年龄",
                        }, { validator: this.checkAge 
                        }],
                    })(
                        <Input placeholder="请输入年龄" />
                    )}
                </FormItem>
                <FormItem labelCol={{ span: 5}} wrapperCol={{ span: 17 }} label="主诉">
                    {form.getFieldDecorator('complaint', {
                        rules: [{
                            required: true, whitespace: true, message: "请输入主诉",
                        }],
                    })(
                        <Input.TextArea 
                            placeholder="请输入主诉"
                            autosize={{ minRows: 2, maxRows: 4 }}
                        />
                    )}
                </FormItem>
                <FormItem labelCol={{ span: 5}} wrapperCol={{ span: 17 }} label="现病史">
                    {form.getFieldDecorator('present', {
                        rules: [{
                            required: true, whitespace: true, message: "请输入现病史"
                        }],
                    })(
                        <Input.TextArea 
                            placeholder="请输入现病史"
                            autosize={{ minRows: 1, maxRows: 4 }}
                        />
                    )}
                </FormItem>
                <FormItem labelCol={{ span: 5}} wrapperCol={{ span: 17 }} label="既往史">
                    {form.getFieldDecorator('past', {
                        initialValue: "无",
                        // rules: [{
                        //     required: true, whitespace: true, message: "请输入既往史"
                        // }],
                    })(
                        <Input.TextArea 
                            placeholder="请输入既往史"
                            autosize={{ minRows: 1, maxRows: 4 }}
                        />
                    )}
                </FormItem>
                <FormItem labelCol={{ span: 5}} wrapperCol={{ span: 17 }} label="过敏史">
                    {form.getFieldDecorator('allergy', {
                        initialValue: "无",
                        // rules: [{
                        //     required: true, whitespace: true, message: "请输入过敏史"
                        // }],
                    })(
                        <Input.TextArea 
                            placeholder="请输入过敏史"
                            autosize={{ minRows: 1, maxRows: 4 }}
                        />
                    )}
                </FormItem>
                <FormItem labelCol={{ span: 5}} wrapperCol={{ span: 17 }} label="家族史">
                    {form.getFieldDecorator('family', {
                        initialValue: "无",
                        // rules: [{
                        //     required: true, whitespace: true, message: "请输入家族史"
                        // }],
                    })(
                        <Input.TextArea 
                            placeholder="请输入家族史"
                            autosize={{ minRows: 1, maxRows: 4 }}
                        />
                    )}
                </FormItem>
                <FormItem labelCol={{ span: 5}} wrapperCol={{ span: 17 }} label="生育史">
                    {form.getFieldDecorator('childbearing', {
                        initialValue: "无",
                        // rules: [{
                        //     required: true, whitespace: true, message: "请输入生育史"
                        // }],
                    })(
                        <Input.TextArea 
                            placeholder="请输入生育史"
                            autosize={{ minRows: 1, maxRows: 4 }}
                        />
                    )}
                </FormItem>
                <FormItem labelCol={{ span: 5}} wrapperCol={{ span: 17 }} label="月经史">
                    {form.getFieldDecorator('menstrual', {
                        initialValue: "无",
                        // rules: [{
                        //     required: true, whitespace: true, message: "请输入月经史"
                        // }],
                    })(
                        <Input.TextArea 
                            placeholder="请输入月经史"
                            autosize={{ minRows: 1, maxRows: 4 }}
                        />
                    )}
                </FormItem>
                <FormItem labelCol={{ span: 5}} wrapperCol={{ span: 17 }} label="体格检查">
                    {form.getFieldDecorator('physical', {
                        initialValue: "无",
                        rules: [{
                            required: true, whitespace: true, message: "请输入体格检查"
                        }],
                    })(
                        <Input.TextArea 
                            placeholder="请输入体格检查"
                            autosize={{ minRows: 1, maxRows: 4 }}
                        />
                    )}
                </FormItem>
                <Col span={24} style={{ textAlign: 'center' }}>
                    <Button type="primary" onClick={this.onSubmit}>提交</Button>
                </Col>
            </Form>
        );
    }

    buildExamLineOne(item, index, arrayX) {
        let result = '正常';
        let color = 'green';
        switch (item.value) {
            case 1:
                result = '异常';
                color = 'red';
                break;
            case 2:
                result = '↑过高';
                color = 'red';
                break;
            case -2:
                result = '↓过低';
                color = 'red';
                break;
            default:
                break;
        }
        return (
            <Row>
                <Col span={18}>{item.text}</Col>
                <Col span={6}><span style={{color:color}}>{result}</span></Col>
            </Row>
        )
    }

    buildExams() {
        const { exams } = this.state;
        return (
            <div>
                {exams.map(this.buildExamLineOne.bind(this))}
            </div>
        );
    }

    buildBody() {
        let { gfyDemo: { emrList } } = this.props;
        let extra = (
            <Col style={{}}>
                <Select style={{ width: 300 }}
                        defaultActiveFirstOption={false}
                        showArrow={true}
                        showSearch={true}
                        filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={this.onChangeEmr}
                >
                    {emrList.map( o=> <Select.Option key={o.id.toString()}>{o.title}</Select.Option>)}
                </Select>
            </Col>
		);
        return (
            <Row gutter={8}>
				<Col span={12}>
					<Card title="选择病历" extra={extra}>
                        <Tabs>
                            <Tabs.TabPane tab="文字部分" key="1">
                                {this.buildEmrForm()}
                            </Tabs.TabPane>
                            <Tabs.TabPane tab="检查检验" key="2">
                                {this.buildExams()}
                            </Tabs.TabPane>
                        </Tabs>
					</Card>
				</Col>
				<Col span={12}>
					<Card title="风险提示">
                        {this.buildNoticeBar()}
					</Card>
                    <Card title="权重图" style={{marginTop: 8}}>
                        {this.buildWeightsPopChart()}
					</Card>
				</Col>
			</Row>
        );
    }

	render() {
        const { loading } = this.props;
		return (
			<div style={{minWidth: 1000}}>
                <Spin spinning={loading}>
                    {this.buildSearchBar()}
                    {this.buildBody()}
                </Spin>
			</div>
		);
	}
}
