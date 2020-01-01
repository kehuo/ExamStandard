import React, { PureComponent } from 'react';
import { connect } from 'dva';
import numeral from 'numeral';
import { Row, Col, Input, Select, Icon, Tooltip, message, Button, Breadcrumb, Card } from 'antd';
import ElementComponent from '../../Template/ElementComponent';

import styles from '../MasterData.less';
let underscore = require('underscore');
const _ = require('lodash');

export default class MappingItemPanel extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {
			mode: 'edit',

			mapping_id: 0,
			source_text: '',
			hpo_code: '',
			hpo_name: '',
			similarity: 0,

            candidates: [],
            
            searchText: '',
            searchResults: [],

			parentsX: [
				{code:'HP:0000001', name:'全部'},
			],
			childrenX: [],
		};
	}

	componentDidMount() {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				parentCode: 'HP:0000001',
				page: 1,
				pageSize: 200,
			},
			callback: this.updateChildrenX.bind(this, {code:'HP:0000001', name:'全部'})
		};
		onQuery('hpo_children', params);
	}

	switchTabProcess(record) {
		if (!record) {
			this.setState({
				mode: 'new',

				mapping_id: 0,
				source_text: '',
				hpo_code: '',
				hpo_name: '',
				similarity: 0,

                candidates: [],
                
                searchText: '',
                searchResults: [],
			});
			return;
		}

		this.setState({
			mode: 'edit',

			mapping_id: record.id,
			source_text: record.source_text,
			hpo_code: record.hpo_code,
			hpo_name: record.hpo_name,
			similarity: record.similarity,

            candidates: [],
            searchText: '',
            searchResults: [],
		});
	}

	updateChildrenX(curParent, data) {
		let tgtIdx = -1;
		let parentsX = this.state.parentsX;
		for (let i=0; i<parentsX.length; i++) {
			let curP = parentsX[i];
			if (curP.code == curParent.code) {
				tgtIdx = i;
				break;
			}
		}
		if (tgtIdx == -1) {
			let lastParent = parentsX[parentsX.length-1];
			let idx = curParent.parents.indexOf(lastParent.code);
			if (idx == -1) {
				message.error('异常操作!');
				return;
			}
			parentsX.push(curParent);
		} else {
			parentsX = parentsX.slice(0, tgtIdx+1);
		}

		this.setState({
			parentsX: parentsX,
			childrenX: data,
		});
	}

	updateCandidates(data) {
		this.setState({
			candidates: data,
		});
    }
    
    updateSearchResults(data) {
        this.setState({
            searchResults: data,
        });
    }

	getSuggestion() {
		const { onQuery } = this.props;
        const { source_text } = this.state;
        if (_.isEmpty(source_text)) {
            message.error('缺少目标文本，无法查找推荐')
            return;
        }
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				text: source_text,
				threshold: 0.7,
				topn: 5,
			},
			callback: this.updateCandidates.bind(this)
		};
		onQuery('suggest', params);
    }

    onChangeSearch = (e) => {
        console.log('onChangeSearch', e.target.value);
        this.setState({
            searchText: e.target.value
        });
    }
    
    onSearch = () => {
        const { onQuery } = this.props;
        const { searchText } = this.state;
        let keyword = searchText ? _.trim(searchText) : '';
        if (keyword) {
            this.setState({
                searchResults: []
            });
        }
        if (!onQuery) {
			return;
		}
		let params = {
			payload: {
                keyword: keyword,
                page: 1,
                pageSize: 20,
			},
			callback: this.updateSearchResults.bind(this)
		};
		onQuery('hpo_search', params);
    }

	selectCandidate(item) {
		this.setState({
			hpo_code: item.code,
			hpo_name: item.name,
			similarity: item.similarity,
		});
	}

	back2list() {
		const { onSwitchTab } = this.props;
		if (!onSwitchTab) {
			return;
		}
		onSwitchTab('MappingList', null);
	}

	isValidContent() {
		const { mode, mapping_id, source_text, hpo_code, hpo_name, similarity } = this.state;
		let msgs = [];
		if (mode != 'new' && !mapping_id) {
			msgs.push('异常操作,映射id非法');
		}
		if (!source_text) {
			msgs.push('目标文本为空');
		}
		if (!hpo_code) {
			msgs.push('HPO代码空');
		}
		if (!hpo_name) {
			msgs.push('HPO名称为空');
		}
		if (!similarity) {
			msgs.push('相似度为0');
		}
		let rst = {
			ok: (msgs.length == 0),
			msg: msgs.join(';')
		};
		return rst;
	}

	onSubmit() {
		const { onQuery } = this.props;
		const { mode, mapping_id, source_text, hpo_code, hpo_name, similarity } = this.state;
		if (!onQuery) {
			return;
		}
		let rst = this.isValidContent();
		if (!rst.ok) {
			message.error(rst.msg);
			return;
		}
		let x = {
			id: mapping_id,
			source_text: source_text,
			hpo_code: hpo_code,
			hpo_name: hpo_name,
			similarity: similarity
		};
		let params = {
			payload: x,
			callback: this.back2list.bind(this)
		};
		let cmd = 'create_mapping';
		if (mode == 'edit') {
			cmd = 'update_mapping';
		}
		onQuery(cmd, params);
	}

	buildCandidateOne(item, index) {
		let text = item.name;
		// if (text.length > 10) {
		// 	let shortText = text.substring(0, 7) + '...';
		// 	text = (
		// 		<Tooltip title={text}>{shortText}</Tooltip>
		// 	);
		// }
		return (
			<Row gutter={8}
			     style={{cursor:'pointer'}} onClick={this.selectCandidate.bind(this, item)}
			>
				<Col span={4}>
					<Tooltip title={item.similarity}>{numeral(item.similarity).format('0.0000')}</Tooltip>
				</Col>
				<Col span={6}>
					{item.code}
				</Col>
				<Col span={13}>
					{text}
				</Col>
			</Row>
		);
    }
    
    buildSearchResultOne(item, index) {
		let text = item.name;
		// if (text.length > 10) {
		// 	let shortText = text.substring(0, 7) + '...';
		// 	text = (
		// 		<Tooltip title={text}>{shortText}</Tooltip>
		// 	);
		// }
		return (
			<Row gutter={8}
			     style={{cursor:'pointer'}} onClick={this.selectCandidate.bind(this, item)}
			>
				<Col span={4}>
					{item.similarity}
				</Col>
				<Col span={6}>
					{item.code}
				</Col>
				<Col span={13}>
					{text}
				</Col>
			</Row>
		);
    }

	buildItemPart() {
		const { mode, candidates, searchResults, searchText } = this.state;
		const lineOne = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '目标文本', tag: 'source_text'
				}]
			},
		];
		const lineOneReadOnly = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'label',
					title: '目标文本', tag: 'source_text'
				}]
			},
		];
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: 'HPO代码', tag: 'hpo_code'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: 'HPO名称', tag: 'hpo_name'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 8, inputNumber:6}, elementType: 'slider',
					title: '相似度', tag: 'similarity', min:0, max:1, step:0.01
				}]
			},
		];
		let extra = (
			<Button type="primary" onClick={this.getSuggestion.bind(this)}>查找推荐</Button>
        );
        let extraSearch = (
			<Input.Search onSearch={this.onSearch} onChange={this.onChangeSearch} value={searchText}/>
		);
		return (
			<Col span={10}>
				{mode == 'new' && lineOne.map(this.renderLine.bind(this))}
				{mode == 'edit' && lineOneReadOnly.map(this.renderLine.bind(this))}
				{lines.map(this.renderLine.bind(this))}
				<Row style={{textAlign:'center', marginBottom:8}}>
					<Button type="primary" onClick={this.onSubmit.bind(this)}>提交</Button>
				</Row>
				<Card title="推荐列表" extra={extra}>
					{candidates.length == 0 && <span>暂无推荐</span>}
					{candidates.length > 0 &&
						candidates.map(this.buildCandidateOne.bind(this))
					}
				</Card>

                <Card title="搜索列表" extra={extraSearch} style={{ marginTop: 12 }}>
					{searchResults.length == 0 && <span>暂无推荐</span>}
					{searchResults.length > 0 &&
						searchResults.map(this.buildSearchResultOne.bind(this))
					}
				</Card>
			</Col>
		);
	}

	selectParent(item) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				parentCode: item.code,
				page: 1,
				pageSize: 200,
			},
			callback: this.updateChildrenX.bind(this, item),
		};
		onQuery('hpo_children', params);
	}

	buildParentOne(parentOne, index) {
		let comp = null;
		if (index == 0) {
			comp = (
				<Icon type="home" />
			);
		} else {
			comp = parentOne.name;
			if (parentOne.name.length > 10) {
				let shortText = parentOne.name.substring(0, 7) + '...';
				comp = (
					<Tooltip title={parentOne.name}>{shortText}</Tooltip>
				);
			}
		}
		return (
			<Breadcrumb.Item onClick={this.selectParent.bind(this, parentOne)}>
				{comp}
			</Breadcrumb.Item>
		);
	}

	buildChildOne(item, index) {
		let text = item.name;
		// if (text.length > 10) {
		// 	let shortText = text.substring(0, 20) + '...';
		// 	text = (
		// 		<Tooltip title={text}>{shortText}</Tooltip>
		// 	);
        // }
        let rowClassName = index % 2 === 0 ? styles.rowEven : styles.rowOdd;
		return (
			<Row style={{marginTop: 4}} className={rowClassName}>
				<Col span={6} className={styles.ListOpEdit}
				     onClick={this.selectParent.bind(this, item)}>
					{item.code}
				</Col>
				<Col span={13}>
					{text}
				</Col>
				<Col span={4} className={styles.ListOpEnable} style={{textAlign:'center'}}
				     onClick={this.selectCandidate.bind(this, item)}>
					<span>选择</span>
				</Col>
			</Row>
		);
	}

	buildRefPart() {
		const { parentsX, childrenX } = this.state;
		return (
			<Col span={13}>
				<Card title="层级">
					<Breadcrumb>
						{parentsX.map(this.buildParentOne.bind(this))}
					</Breadcrumb>
				</Card>
				<Card title="节点">
					{childrenX.map(this.buildChildOne.bind(this))}
				</Card>
			</Col>
		);
    }
    
    buildSearchPart() {

    }

	render() {
		return (
			<div style={{minWidth:1000}}>
				<Row gutter={8}>
					{this.buildItemPart()}
                    {this.buildRefPart()}
				</Row>
			</div>
		);
	}
}