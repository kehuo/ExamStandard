import React, { Component } from 'react';
import { connect } from 'dva';
import $ from 'jquery';
import { Input, Row, Col, Button, Form, Upload, message, Icon } from 'antd';
import {Link, withRouter} from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

// import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Setting.less';

const FormItem = Form.Item;
const breadcrumbList = [
  {
    title: '首页',
    href: '/welcome',
  },
  {
    title: '个人信息',
    href: '/user/userInfo',
  },
];

@connect(({ user, loading }) => ({
  currentUser: user.currentUser,
  // userGetting: loading.effects['user/updateUserInfo'],
}))
@Form.create()
export default class UserInfo extends Component {
  state = {
    height: 450,
    loading: false,
    currentUser: this.props.currentUser,
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'user/fetchCurrent',
    });
    this.handleResize();
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.currentUser) !== '{}') {
      this.setState({ currentUser: nextProps.currentUser });
    }
  }

  handleResize() {
    let height = window.innerHeight - 235;
    height = height > 480 ? height : 480;
    this.setState({ height });
    $('#profileBody').attr('style', 'top: ' + (height - 480) / 2 + 'px');
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <PageHeader breadcrumbList={breadcrumbList}> </PageHeader>

        <div className={styles.setting} style={{ height: this.state.height, minHeight: 480 }}>
          <div id="profileBody" className={styles.mainBody}>
            <Form hideRequiredMark >
              <FormItem
                label="账号"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
              >
                {getFieldDecorator('userName', {
                  initialValue: this.state.currentUser.userName,
                })(
                  <Input disabled />
                )}
              </FormItem>
              <FormItem
                label="姓名"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
              >
                {getFieldDecorator('fullName', {
                  rules: [{ required: true, message: '请输入姓名' }],
                  initialValue: this.state.currentUser.fullName,
                })(
                  <Input disabled />
                )}
              </FormItem>

              <FormItem
                label="机构编码"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
              >
                {getFieldDecorator('orgCode', {
                  rules: [{ required: false, message: '请输入机构编码' }],
                  initialValue: this.state.currentUser.orgCode,
                })(
                  <Input disabled />
                )}
              </FormItem>

              <FormItem
                label="角色"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
              >
                {getFieldDecorator('roleName', {
                  rules: [
                    { required: false, message: '请输入角色名' },
                  ],
                  initialValue: this.state.currentUser.roleName,
                })(
                  <Input disabled />
                )}
              </FormItem>
            </Form>
          </div>
        </div>

      </div>
    );
  }
}

