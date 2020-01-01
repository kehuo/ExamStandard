import React, { Component, PropTypes } from 'react';
import { Table, Badge, Dropdown, Icon } from 'antd';

let Immutable = require('immutable');

export default class NormalizedVectorTable extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = this.initData(props);
    }

    initData(props) {
        let x = [];
        if (props.data) {
            for (let i=0; i<props.data.length; i++) {
                let curD = props.data[i];
                if (curD.bb_extension) {
                    x = x.concat(curD.bb_extension)
                }
            }
        }
        let newState = {
            data: x,
        };
        return newState;
    }

    componentWillReceiveProps(nextProps) {
        let isSame = Immutable.is(this.props.data, nextProps.data);
        if (isSame) {
            return;
        }
        let newState = this.initData(nextProps);
        this.setState(newState);
    }

    expandedRowRender(record, index, indent, expanded) {
        let items = [];
        if (record.radlex_info) {
            items = record.radlex_info;
        }
        if (items.length == 0) {
            return null;
        }
        let lines = [];
        for (let i=0; i<items.length; i++) {
            let y = items[i];
            let x = (<p>RadLex:{y.cn_name} {y.radlex_id}</p>)
            lines.push(x);
        }
        return (
            <div>{lines}</div>
        );
    }

    render() {
        const { data } = this.state;
        const columns = [
            { title: '名称', dataIndex: 'text'},
            { title: '详细', dataIndex: 'detailed_text'}
        ];
        return (
            <Table
                columns={columns}
                expandedRowRender={this.expandedRowRender.bind(this)}
                dataSource={data}
            />
        )
    }
}

// ReactDOM.render(<NestedTable />, mountNode);
