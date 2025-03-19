// 引入预约服务
const appointmentService = require('../../utils/appointmentService');
const authService = require('../../utils/authService');

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
    showSuccessModal: false,
    showAuthButton: false  // 添加显示授权按钮的状态
  },
  
  onLoad: function() {
    this.initTimePickerArray();
    // 检查登录状态
    if (!authService.checkLogin()) {
      this.setData({
        showAuthButton: true
      });
    }
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
  
  // 处理授权登录
  handleAuth() {
    this.setData({ 
      isLoading: true,
      showAuthButton: false
    });

    wx.getUserProfile({
      desc: '需要您的授权才能使用预约功能',
      success: (userInfo) => {
        authService.getLoginCode()
          .then(code => {
            return authService.loginWithCodeAndUserInfo(code, userInfo);
          })
          .then(() => {
            this.setData({
              showAuthButton: false
            });
            wx.showToast({
              title: '登录成功',
              icon: 'success'
            });
          })
          .catch(err => {
            console.error('登录失败:', err);
            this.setData({
              showAuthButton: true
            });
            wx.showToast({
              title: '登录失败，请重试',
              icon: 'none'
            });
          })
          .finally(() => {
            this.setData({
              isLoading: false
            });
          });
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        this.setData({
          isLoading: false,
          showAuthButton: true
        });
        wx.showToast({
          title: '需要您的授权才能预约',
          icon: 'none'
        });
      }
    });
  },
  
  // 修改提交预约方法
  submitBooking: function() {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善信息',
        icon: 'none'
      });
      return;
    }

    // 检查登录状态
    if (!authService.checkLogin()) {
      this.setData({
        showAuthButton: true
      });
      wx.showToast({
        title: '请先点击授权按钮',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '提交中...',
    });

    // 构建预约时间字符串
    const timeArray = this.data.timeArray;
    const timeIndex = this.data.timeIndex;
    const year = timeArray[0][timeIndex[0]].replace('年', '');
    const month = timeArray[1][timeIndex[1]].replace('月', '').padStart(2, '0');
    const day = timeArray[2][timeIndex[2]].replace('日', '').padStart(2, '0');
    const hour = timeArray[3][timeIndex[3]].replace('时', '').padStart(2, '0');
    const minute = timeArray[4][timeIndex[4]].replace('分', '').padStart(2, '0');
    const appointmentTime = `${year}-${month}-${day}T${hour}:${minute}:00`;

    // 调用预约服务
    appointmentService.addAppointment({
      appointmentTime: appointmentTime,
      userName: this.data.name,
      userPhone: this.data.phone
    })
    .then(res => {
      wx.hideLoading();
      console.log('预约成功:', res);
      this.setData({
        showSuccessModal: true
      });
    })
    .catch(err => {
      wx.hideLoading();
      console.error('预约失败:', err);
      if (err.code === 401 || err.code === "40300") {
        this.setData({
          showAuthButton: true
        });
        wx.showToast({
          title: '请重新授权',
          icon: 'none'
        });
      } else {
        wx.showToast({
          title: err.message || '预约失败',
          icon: 'none'
        });
      }
    });
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