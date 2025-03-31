Page({
  data: {
    // 顶部 4 个 Tab
    tabs: [
      { name: '报事申请', page: '/pages/repair/prerepair' },
      { name: '待受理', page: '/pages/repair/repair_list' },
      { name: '处理中', page: '/pages/repair/repairing' },
      { name: '已完成', page: '/pages/repair/repaired' }
    ],
    activeTab: 0,

    // 标题字体大小
    titleFontSize: '36rpx',

    // 添加上传图片数组
    uploadedImages: [],

    // 表单字段
    houseNumber: '',
    emergencyLevel: '',  // "低" | "中" | "高"
    repairArea: '公共区域',  // "户内" | "公共区域"
    description: '',
    contactName: '',
    contactPhone: '',
    expectedDate: 'YYYY - MM - DD',  // 初始占位
    timeSlots: ['8-12点', '14-18点'],
    selectedTimeSlot: '',

    // 紧急程度图片路径
    emergencyImages: {
      '低': '/images/repair/low.png',
      '中': '/images/repair/mid.png',
      '高': '/images/repair/high.png'
    },
    
    // 待受理维修列表 - 用于Tab 1
    pendingOrders: [
      {
        id: 1,
        orderNumber: 'WX20230001',
        status: '待受理',
        createTime: '2023-06-01 10:30',
        description: '厨房水龙头漏水',
        emergencyLevel: '中'
      },
      {
        id: 2,
        orderNumber: 'WX20230002',
        status: '待受理',
        createTime: '2023-06-02 14:20',
        description: '卫生间灯不亮',
        emergencyLevel: '高'
      }
    ],
    
    // 处理中维修列表 - 用于Tab 2
    processingOrders: [
      {
        id: 3,
        orderNumber: 'WX20230003',
        status: '处理中',
        createTime: '2023-05-28 09:15',
        description: '客厅空调不制冷',
        emergencyLevel: '低'
      },
      {
        id: 4,
        orderNumber: 'WX20230004',
        status: '处理中',
        createTime: '2023-05-29 16:40',
        description: '厨房排水管堵塞',
        emergencyLevel: '中'
      }
    ],
    
    // 已完成维修列表 - 用于Tab 3
    completedOrders: [
      {
        id: 5,
        orderNumber: 'WX20230005',
        status: '已完成',
        createTime: '2023-05-20 16:40',
        completeTime: '2023-05-21 11:30',
        description: '卧室门锁坏了',
        emergencyLevel: '高'
      },
      {
        id: 6,
        orderNumber: 'WX20230006',
        status: '已完成',
        createTime: '2023-05-15 09:20',
        completeTime: '2023-05-15 14:30',
        description: '客厅灯不亮',
        emergencyLevel: '中'
      }
    ]
  },

  onLoad() {
    // 可在此处请求后端接口，获取实际数据并 setData
  },

  // 点击顶部Tab - 修改为在当前页面切换内容
  onTabClick(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
    // 不再跳转页面，而是在当前页面切换内容
  },

  // 点击左上角返回箭头
  // 添加返回按钮功能
  onBack: function() {
  // 判断是否可以返回上一页
  const pages = getCurrentPages();
  if (pages.length > 1) {
    wx.navigateBack({
      delta: 1
    });
  } else {
    // 如果没有上一页，则跳转到首页
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
},

  // 房号输入
  onHouseNumberInput(e) {
    this.setData({ houseNumber: e.detail.value });
  },

  // 紧急程度点击
  onEmergencyTap(e) {
    const level = e.currentTarget.dataset.level;
    this.setData({ emergencyLevel: level });
  },

  // 维修区域选择
  onAreaTap(e) {
    const area = e.currentTarget.dataset.area;
    this.setData({ repairArea: area });
  },

  // 问题描述输入
  onDescriptionInput(e) {
    this.setData({ description: e.detail.value });
  },

  // 上传按钮点击
  onUploadTap() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // 获取图片临时路径
        const tempFilePaths = res.tempFilePaths;
        // 将新上传的图片添加到已有图片数组中
        const newImages = [...that.data.uploadedImages, ...tempFilePaths];
        // 最多允许上传3张图片
        if (newImages.length > 3) {
          wx.showToast({
            title: '最多上传3张图片',
            icon: 'none'
          });
          return;
        }
        that.setData({
          uploadedImages: newImages
        });
      }
    });
  },
  
  // 删除已上传图片
  onDeleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.uploadedImages];
    images.splice(index, 1);
    this.setData({
      uploadedImages: images
    });
  },

  // 联系人输入
  onContactNameInput(e) {
    this.setData({ contactName: e.detail.value });
  },

  // 联系方式输入
  onContactPhoneInput(e) {
    // 仅保留数字
    const val = e.detail.value.replace(/\D/g, '');
    this.setData({ contactPhone: val });
  },

  // 期望上门时间
  onDateChange(e) {
    // 这里可将选择的日期格式化后显示
    this.setData({ expectedDate: e.detail.value });
  },

  // 时间段选择
  onTimeSlotTap(e) {
    const slot = e.currentTarget.dataset.slot;
    this.setData({ selectedTimeSlot: slot });
  },
  
  // 重置
  onReset() {
    this.setData({
      houseNumber: '',
      emergencyLevel: '',
      repairArea: '公共区域',
      description: '',
      contactName: '',
      contactPhone: '',
      expectedDate: 'YYYY - MM - DD',
      selectedTimeSlot: '',
      uploadedImages: []
    });
  },
  
  // 提交
  onSubmit() {
    const {
      houseNumber,
      emergencyLevel,
      repairArea,
      description,
      contactName,
      contactPhone,
      expectedDate,
      selectedTimeSlot,
      uploadedImages
    } = this.data;
    
    // 示例校验：联系方式必须为11位
    if (contactPhone.length !== 11) {
      wx.showToast({
        title: '联系方式需为11位数字',
        icon: 'none'
      });
      return;
    }

    // 其它校验或提交逻辑...
    wx.showToast({
      title: '提交成功',
      icon: 'success'
    });
    
    console.log('提交表单:', {
      houseNumber,
      emergencyLevel,
      repairArea,
      description,
      contactName,
      contactPhone,
      expectedDate,
      selectedTimeSlot,
      uploadedImages
    });
  },
  
  // 点击"联系维修人员"按钮
  onContact: function(e) {
    const index = e.currentTarget.dataset.index;
    const type = e.currentTarget.dataset.type;
    let repairItem;
    
    // 根据当前激活的Tab确定使用哪个列表
    if (type === 'pending') {
      repairItem = this.data.pendingOrders[index];
    } else if (type === 'processing') {
      repairItem = this.data.processingOrders[index];
    } else {
      repairItem = this.data.completedOrders[index];
    }
    
    // 模拟维修人员电话号码
    const phoneNumber = repairItem.repairManPhone || '13800138000';
    const repairManName = repairItem.repairManName || '张师傅';
    
    // 弹窗显示维修人员电话
    wx.showModal({
      title: '维修人员联系方式',
      content: `${repairManName}: ${phoneNumber}`,
      confirmText: '拨打',
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          // 用户点击了拨打按钮
          wx.makePhoneCall({
            phoneNumber: phoneNumber,
            fail(err) {
              console.error('拨打电话失败', err);
              wx.showToast({
                title: '拨打失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 点击"催单"按钮
  onUrge: function(e) {
    // 弹窗显示"已催单"
    wx.showToast({
      title: '已催单',
      icon: 'success',
      duration: 2000
    });
  }
});