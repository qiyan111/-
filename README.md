# e家畅行小程序

## 项目目标
开发一个物业服务类微信小程序，包含门禁控制、访客通行、报事维修、车位查询以及生活缴费等功能。

## 功能模块
- 门禁控制：用户可远程控制小区门禁
- 访客通行：管理访客进出权限
- 报事维修：提交物业维修申请
- 车位查询：查询小区车位情况
- 生活缴费：支付物业费、水电费等

## 技术栈
- 开发框架：微信小程序原生框架
- UI组件：自定义组件
- 数据管理：云开发（CloudBase）
- 网络请求：wx.request 和云函数

## 文件结构
- app.js: 小程序入口文件
- app.json: 小程序全局配置
- app.wxss: 小程序全局样式
- pages/: 小程序页面
  - index/: 首页
  - community/: 社区页
  - door/: 开门页
  - message/: 信息页
  - my/: 我的页面
- images/: 图标和图片资源
- components/: 自定义组件

## 开发进度
- [x] 项目初始化
- [x] 首页设计与实现
- [ ] 功能模块开发
- [ ] 页面交互完善
- [ ] 后端接口对接
- [ ] 测试与调试
- [ ] 发布上线 