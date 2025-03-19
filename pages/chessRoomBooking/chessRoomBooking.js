Page({
  data: {
    selectedLocation: '',
    timeArray: [], // 这里需要生成年月日时分的数组
    timeIndex: [0, 0, 0, 0, 0],
    name: '',
    phone: '',
    errors: {
      location: false,
      name: false,
      phone: false
    },
    showSuccessModal: false
  },
  
  onLoad: function() {
    this.initTimePickerArray();
  },
  
  // 初始化时间选择器数组
  initTimePickerArray() {
    // 这里设置年月日时分的选择数组
    const date = new Date();
    const years = [];
    const months = [];
    const days = [];
    const hours = [];
    const minutes = [];
    
    // 设置年份范围（当前年份开始，往后2年）
    for (let i = date.getFullYear(); i <= date.getFullYear() + 2; i++) {
      years.push(i + '年');
    }
    
    // 设置月份
    for (let i = 1; i <= 12; i++) {
      months.push(i + '月');
    }
    
    // 设置天数（暂时设31天，实际应根据年月动态调整）
    for (let i = 1; i <= 31; i++) {
      days.push(i + '日');
    }
    
    // 设置小时
    for (let i = 0; i < 24; i++) {
      hours.push(i + '时');
    }
    
    // 设置分钟
    for (let i = 0; i < 60; i += 5) { // 每5分钟一个选项
      minutes.push(i + '分');
    }
    
    this.setData({
      timeArray: [years, months, days, hours, minutes]
    });
  },
  
  // 选择地点
  selectLocation: function(e) {
    const location = e.currentTarget.dataset.location;
    this.setData({
      selectedLocation: location
    });
  },
  
  // 时间选择器改变
  bindTimeChange: function(e) {
    this.setData({
      timeIndex: e.detail.value
    });
  },
  
  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },
  
  // 重置表单
  resetForm: function() {
    this.setData({
      selectedLocation: '',
      timeIndex: [0, 0, 0, 0, 0],
      name: '',
      phone: '',
      errors: {
        location: false,
        name: false,
        phone: false
      }
    });
  },
  
  // 姓名输入
  nameInput: function(e) {
    this.setData({
      name: e.detail.value,
      'errors.name': false
    });
  },
  
  // 电话输入
  phoneInput: function(e) {
    this.setData({
      phone: e.detail.value,
      'errors.phone': false
    });
  },
  
  // 验证表单
  validateForm: function() {
    let isValid = true;
    let errors = {
      location: false,
      name: false,
      phone: false
    };
    
    // 验证选择的场地
    if (!this.data.selectedLocation) {
      errors.location = true;
      isValid = false;
    }
    
    // 验证姓名
    if (!this.data.name.trim()) {
      errors.name = true;
      isValid = false;
    }
    
    // 验证电话
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!this.data.phone || !phoneReg.test(this.data.phone)) {
      errors.phone = true;
      isValid = false;
    }
    
    this.setData({ errors });
    return isValid;
  },
  
  // 提交预约
  submitBooking: function() {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善信息',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '提交中...',
    });
    
    // 模拟提交
    setTimeout(() => {
      wx.hideLoading();
      
      // 显示预约成功弹窗
      this.setData({
        showSuccessModal: true
      });
    }, 1500);
  },
  
  // 关闭成功弹窗
  closeSuccessModal: function() {
    this.setData({
      showSuccessModal: false
    });
    
    // 可以选择是否要重置表单或返回上一页
    this.resetForm();
  }
}) 