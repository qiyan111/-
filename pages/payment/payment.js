Page({
  data: {
    activeTab: 0, // 0: 待缴费, 1: 已缴费
    pendingBills: [ // 待缴费数据
      {
        id: '1',
        billNo: 'XXXXXXXXXXXX',
        billType: '水电费',
        detail: '用水 XX吨，用电 XX度',
        period: 'X月X日-X月X日',
        amount: 'XX'
      }
    ],
    paidBills: [], // 已缴费数据 (可添加模拟数据)
    bills: [] // 当前显示的数据
  },
  
  onLoad() {
    // 初始化时根据 activeTab 设置 bills
    this.setData({
      bills: this.data.activeTab === 0 ? this.data.pendingBills : this.data.paidBills
    });
    // 如果需要从 API 加载真实数据，在这里调用修改后的 fetchBillData
  },
  
  // 切换标签
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    if (index === this.data.activeTab) return; // 避免重复点击当前标签

    console.log('切换到标签:', index);
    this.setData({
      activeTab: index,
      // 根据新的 activeTab 切换 bills 的数据源
      bills: index === 0 ? this.data.pendingBills : this.data.paidBills
    });
  },
  
  // 点击缴费按钮
  payBill(e) {
    const billId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '缴费功能开发中',
      icon: 'none'
    });
  },
  
  // 返回上一页
  navigateBack() {
    console.log('返回按钮被点击');
    wx.navigateBack({
      delta: 1,
      fail: function() {
        // 如果返回失败，则回到首页
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  }
}) 