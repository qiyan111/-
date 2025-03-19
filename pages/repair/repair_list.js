Page({
  data: {
    // 导航栏数据
    tabs: [
      { name: '报事申请', page: '/pages/prerepair/prerepair' },
      { name: '待处理',   page: '/pages/repair_list/repair_list' },
      { name: '处理中',   page: '/pages/repairing/repairing' },
      { name: '已完成',   page: '/pages/repaired/repaired' }
    ],
    activeTab: 1,

    // 紧急程度图片路径：根据后端返回值（低/中/高）映射到不同图片
    emergencyImages: {
      '低': '/images/repair/low.png',
      '中': '/images/repair/mid.png',
      '高': '/images/repair/high.png'
    },

    // 模拟从后端获取的维修信息列表
    repairList: [
      {
        orderNumber: '******',
        repairArea: '地点描述',
        faultDesc: '这里是详细的故障描述文字',
        emergencyLevel: '中',       // 后端返回 "低"/"中"/"高"
        expectedTime: 'YYYY-MM-DD-HH',
        status: '待受理',
        repairManPhone: '12345678901'
      },
      {
        orderNumber: '******',
        repairArea: '地点描述2',
        faultDesc: '这里是另一条故障描述',
        emergencyLevel: '高',
        expectedTime: '2025-03-10-14',
        status: '待受理',
        repairManPhone: '09876543210'
      }
    ]
  },

  // 点击左上角返回箭头
  onBack() {
    wx.navigateBack();
  },

  // 点击导航栏
  onTabClick(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
    wx.navigateTo({ url: this.data.tabs[index].page });
  },

  // 点击“联系维修人员”按钮
  onContact(e) {
    const index = e.currentTarget.dataset.index;
    const repairItem = this.data.repairList[index];
    // 弹窗显示维修人员电话
    wx.showModal({
      title: '维修人员电话',
      content: repairItem.repairManPhone || '暂无号码',
      showCancel: false
    });
  },

  // 点击“催单”按钮
  onUrge(e) {
    // 弹窗显示“已催单”
    wx.showModal({
      title: '提示',
      content: '已催单',
      showCancel: false
    });
  }
});
