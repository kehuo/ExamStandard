import React, { PureComponent } from 'react';
import { Icon,Menu,Divider,Spin,Dropdown,Badge } from 'antd';
import Link from 'umi/link';
import Debounce from 'lodash-decorators/debounce';
import styles from './index.less';
import BBIcon from '../BBIcon';

export default class GlobalHeader extends React.Component {
  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }
  /* eslint-disable*/
  @Debounce(600)
  triggerResizeEvent() {
    // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }
  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  };
  // render() {
  //   const { collapsed, isMobile, logo } = this.props;
  //   return (
  //     <div className={styles.header}>
  //       {isMobile && (
  //         <Link to="/" className={styles.logo} key="logo">
  //           <img src={logo} alt="logo" width="32" />
  //         </Link>
  //       )}
  //       <Icon
  //         className={styles.trigger}
  //         type={collapsed ? 'menu-unfold' : 'menu-fold'}
  //         onClick={this.toggle}
  //       />
  //
  //       <RightContent {...this.props} />
  //     </div>
  //   );
  // }
  onClickBadge() {
    const { count } = this.props;
      if (this.props.gotoNotification) {
          this.props.gotoNotification(count);
      }
  }

  render() {
    const {
      currentUser, collapsed, isMobile, logo, onMenuClick, title, count
    } = this.props;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        <Menu.Item key="userinfo"><Icon type="user"/>个人信息</Menu.Item>
        {/* <Menu.Item key="setting"><Icon type="setting" />修改密码</Menu.Item> */}
        {/*<Menu.Item key="triggerError"><Icon type="close-circle" />触发报错</Menu.Item>*/}
        <Menu.Divider />
        <Menu.Item key="logout"><Icon type="logout"/>退出登录</Menu.Item>
      </Menu>
    );
    return (
      <div className={styles.header}>
          <Icon
            className={styles.trigger}
            type={collapsed ? 'menu-unfold' : 'menu-fold'}
            onClick={this.toggle}
          />
        { !isMobile && (
          [
            <span className={styles.title}>{title}</span>,
            <Divider className={styles.divider} type="vertical" key="line"/>,
          ]
        )}

        <div className={styles.right}>
          <span className={styles.noticeButton} onClick={this.onClickBadge.bind(this)}>
              <Badge count={count} style={{ boxShadow: 'none' }} >
                  <Icon type="bell" className={styles.icon} />
              </Badge>
          </span>
          {currentUser.userName ? (
            <Dropdown overlay={menu}>
                <span className={`${styles.action} ${styles.account}`}>
                    <Icon type="user" style={{fontSize:20}}/>
                    <span className={styles.name} style={{fontSize:16}}>{currentUser.userName}</span>
                </span>
            </Dropdown>
          ) : <Spin size="small" style={{ marginLeft: 8 }}/>}
        </div>
      </div>
    );
  }
}
