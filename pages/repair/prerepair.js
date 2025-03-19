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
    }
  },

  onLoad() {
    // 可在此处请求后端接口，获取实际数据并 setData
  },

  // 点击顶部Tab
  onTabClick(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
    wx.navigateTo({ url: this.data.tabs[index].page });
  },

  // 点击左上角返回箭头
  onBack() {
    wx.navigateBack();
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
  }
});
