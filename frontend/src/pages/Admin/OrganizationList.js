import React, { PureComponent } from "react";
import { connect } from "dva";
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm, Upload } from "antd";
import OrganizationPopup from "./OrganizationPopup";
import ImpOrganizationPopup from "./ImpOrganizationPopup";

import styles from "./Org.less";

let underscore = require("underscore");

@connect(({ organization }) => ({
  organization
}))
export default class OrganizationList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      pageSize: 10,
      keyword: "",
      status: "all",

      showPopup: false,
      hotOne: {}
    };
  }

  buildListQueryParams() {
    const { page, pageSize, keyword, status } = this.state;
    let params = {
      page: page,
      pageSize: pageSize,
      keyword: keyword,
      status: status
    };
    if (!keyword) {
      delete params.keyword;
    }
    return params;
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: "organization/init",
      payload: this.buildListQueryParams()
    });
  }

  onListPageChange(page, pageSize) {
    this.setState({
      page: page,
      pageSize: pageSize
    }, this.fetchListData.bind(this));
  }

  fetchListData() {
    const { dispatch } = this.props;
    dispatch({
      type: "organization/fetch",
      payload: this.buildListQueryParams()
    });
  }

  disableOrg(record, disabled) {
    const { dispatch } = this.props;
    record.disabled = disabled;
    dispatch({
      type: "organization/edit",
      payload: {
        updateParams: record,
        queryParams: this.buildListQueryParams()
      }
    });
  }

  editOrg(record) {
    this.setState({
      showPopup: true,
      hotOne: record
    });
  }

  deleteOrg(record) {
    const { dispatch } = this.props;
    dispatch({
      type: "organization/delete",
      payload: {
        updateParams: {
          id: record.id
        },
        queryParams: this.buildListQueryParams()
      }
    });
  }


  opRender(text, record, index) {
    let statusOp = (
      <span className={styles.ListApplyOnline} onClick={this.disableOrg.bind(this, record, 1)}>
				<Icon type="rocket" theme="outlined"/>启动运营
			</span>
    );
    let editOp = (
      <span className={styles.ListOpEdit} onClick={this.editOrg.bind(this, record)}
            style={{ marginLeft: 16 }}>
				<Icon type="edit" theme="outlined"/>编辑
			</span>
    );
    let deleteOp = (
      <span className={styles.ListOpDelete} style={{ marginLeft: 16 }}>
				<Popconfirm title="请记得先删除下属机构。确定删除?"
                    onConfirm={this.deleteOrg.bind(this, record)}
                    onCancel={null}
        >
					<Icon type="delete" theme="outlined"/>删除
				</Popconfirm>
			</span>
    );
    if (record.disabled == 1) {
      // statusOp = (
      // 	<span className={styles.ListOpEnable} onClick={this.disableOrg.bind(this, record, 0)}>
      // 		<Icon type="check-circle" theme="outlined"/>启用
      // 	</span>
      // );
      statusOp = (
        <span className={styles.ListIsOnline}>
					<Icon type="fire" theme="outlined"/>运营中
				</span>
      );
      deleteOp = null;
      editOp = (
        <span className={styles.ListOpEdit} onClick={this.editOrg.bind(this, record)}
              style={{ marginLeft: 16 }}>
				<Icon type="edit" theme="outlined"/>查看
			</span>
      );
      ;
    }
    return (
      <div>
        {statusOp}
        {deleteOp}
        {editOp}
      </div>
    );
  }

  onKeywordChange(e) {
    this.setState({
      keyword: e.target.value
    });
  }

  onKeywordSearch(value) {
    this.setState({
      keyword: value,
      page: 1
    }, this.fetchListData.bind(this));
  }

  onSelectChange(tag, val) {
    let curState = this.state;
    curState[tag] = val;
    this.setState(curState, this.fetchListData.bind(this));
  }

  buildOpBar() {
    const { status, keyword } = this.state;
    return (
      <Row style={{ marginTop: 10, marginBottom: 10 }}>
        <Col span={8}>
          关键词: <Input.Search style={{ width: "70%" }} placeholder="input search text"
                             onChange={this.onKeywordChange.bind(this)}
                             onSearch={this.onKeywordSearch.bind(this)}
                             value={keyword}
        />
        </Col>
        <Col span={3} offset={1}>
          状态: <Select style={{ width: "60%" }} value={status}
                      onSelect={this.onSelectChange.bind(this, "status")}>
          <Select.Option value="all">全部</Select.Option>
          <Select.Option value="1">使用中</Select.Option>
          <Select.Option value="0">禁用中</Select.Option>
        </Select>
        </Col>
        <Col span={4} offset={1}>
          <Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建机构</Button>
        </Col>
        <Col span={4} offset={1}>
          <ImpOrganizationPopup/>
        </Col>
      </Row>
    );
  }

  onChange(tag, val) {
    let curState = this.state;
    curState[tag] = val;
    this.setState(curState);
  }

  onShowNewPopup() {
    let x = {
      id: 0,
      code: "",
      name: "",
      certificate: "",
      org_level: "",
      auto_update: 1,
      source_id: "",
      disabled: 0
    };
    this.setState({
      showPopup: true,
      hotOne: x
    });
  }


  editOrganization(record) {
    const { dispatch } = this.props;
    dispatch({
      type: "organization/edit",
      payload: {
        updateParams: record,
        queryParams: this.buildListQueryParams()
      }
    });
  }

  onSubmit(isUpdate, record) {
    let callback = null;
    if (isUpdate) {
      callback = this.editOrganization.bind(this, record);
    }
    this.setState({
      showPopup: false,
      hotOne: record
    }, callback);
  }

  render() {
    const { data, total, diseaseDataSourceOptions, examDataSourceOptions, medicineDataSourceOptions
        } = this.props.organization;
    const { page, pageSize, showPopup, hotOne } = this.state;
    const columns = [
      { dataIndex: "name", title: "机构名称" },
      { dataIndex: "code", title: "编码" },
      { dataIndex: "id", title: "操作", render: this.opRender.bind(this) }
    ];
    let pageOpts = {
      current: page,
      pageSize: pageSize,
      size: "small",
      total: total,
      onChange: this.onListPageChange.bind(this),
      onShowSizeChange: this.onListPageChange.bind(this)
    };
    return (
      <div style={{ width: 1000, margin: "auto", backgroundColor: "white", padding: 20 }}>
        {this.buildOpBar()}
        <Table columns={columns}
               dataSource={data}
               pagination={pageOpts}
        />
        <OrganizationPopup visible={showPopup}
                           item={hotOne}
                           onSubmit={this.onSubmit.bind(this)}
                           diseaseDataSourceOptions={diseaseDataSourceOptions}
                           examDataSourceOptions={examDataSourceOptions}
                           medicineDataSourceOptions={medicineDataSourceOptions}
        />

      </div>
    );
  }
}
