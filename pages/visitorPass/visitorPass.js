// 引入访客服务
const guestService = require('../../utils/guestService');

Page({
  data: {
    formData: {
      guestName: '',
      guestPhone: '',
      visitReason: '',
      visitTime: '',
      building: '',
      floor: ''
    },
    timeArray: [], // 时间选择器数组
    timeIndex: [0, 0, 0, 0, 0],
    buildings: ['1栋', '2栋', '3栋', '4栋', '5栋'],
    buildingIndex: 0,
    floors: ['1层', '2层', '3层', '4层', '5层'],
    floorIndex: 0,
    isSubmitting: false,
    wordCount: 0
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 输入访客姓名
  inputGuestName(e) {
    this.setData({
      'formData.guestName': e.detail.value
    });
  },

  // 输入访客电话
  inputGuestPhone(e) {
    this.setData({
      'formData.guestPhone': e.detail.value
    });
  },

  // 时间选择器改变
  bindTimeChange(e) {
    const timeIndex = e.detail.value;
    const year = this.data.timeArray[0][timeIndex[0]];
    const month = this.data.timeArray[1][timeIndex[1]];
    const day = this.data.timeArray[2][timeIndex[2]];
    const hour = this.data.timeArray[3][timeIndex[3]];
    const minute = this.data.timeArray[4][timeIndex[4]];
    
    const visitTime = `${year}-${month}-${day} ${hour}:${minute}`;
    
    this.setData({
      timeIndex,
      'formData.visitTime': visitTime
    });
  },

  // 楼栋选择器改变
  bindBuildingChange(e) {
    const buildingIndex = e.detail.value;
    this.setData({
      buildingIndex,
      'formData.building': this.data.buildings[buildingIndex]
    });
  },

  // 楼层选择器改变
  bindFloorChange(e) {
    const floorIndex = e.detail.value;
    this.setData({
      floorIndex,
      'formData.floor': this.data.floors[floorIndex]
    });
  },

  // 输入来访原因
  inputVisitReason(e) {
    const value = e.detail.value;
    const wordCount = value.length;
    
    this.setData({
      'formData.visitReason': value,
      wordCount
    });
  },

  // 重置表单
  resetForm() {
    this.setData({
      formData: {
        guestName: '',
        guestPhone: '',
        visitReason: '',
        visitTime: '',
        building: '',
        floor: ''
      },
      timeIndex: [0, 0, 0, 0, 0],
      buildingIndex: 0,
      floorIndex: 0,
      wordCount: 0
    });
  },

  // 生成访客码
  generateVisitorCode() {
    const { guestName, guestPhone, visitReason, visitTime, building, floor } = this.data.formData;
    
    // 表单验证
    if (!guestName) {
      wx.showToast({
        title: '请输入访客姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!guestPhone) {
      wx.showToast({
        title: '请输入访客电话',
        icon: 'none'
      });
      return;
    }
    
    // 手机号验证
    if (!/^1\d{10}$/.test(guestPhone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    if (!visitTime) {
      wx.showToast({
        title: '请选择来访时间',
        icon: 'none'
      });
      return;
    }
    
    if (!building || !floor) {
      wx.showToast({
        title: '请选择拜访地点',
        icon: 'none'
      });
      return;
    }
    
    if (!visitReason) {
      wx.showToast({
        title: '请输入来访原因',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ isSubmitting: true });
    
    // 构建提交数据
    const submitData = {
      guestName,
      guestPhone,
      visitReason,
      visitTime,
      visitLocation: `${building} ${floor}`
    };
    
    // 提交访客申请
    guestService.submitGuestForm(submitData)
      .then(res => {
        console.log('访客申请提交成功:', res);
        this.setData({ isSubmitting: false });
        
        // 假设后端返回的数据中包含访客码ID
        const guestCodeId = res.id || 'guest-' + Date.now();
        
        // 生成访客二维码并跳转到显示页面
        wx.navigateTo({
          url: `/pages/guestForm/guestForm?id=${guestCodeId}&name=${guestName}&time=${encodeURIComponent(visitTime)}&location=${encodeURIComponent(submitData.visitLocation)}`,
          success: () => {
            console.log('跳转到访客二维码页面成功');
          },
          fail: (err) => {
            console.error('跳转到访客二维码页面失败:', err);
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      })
      .catch(err => {
        console.error('访客申请提交失败:', err);
        this.setData({ isSubmitting: false });
        
        wx.showModal({
          title: '提交失败',
          content: err.message || '提交访客申请失败，请重试',
          showCancel: false
        });
      });
  },

  // 页面加载时初始化时间选择器
  onLoad: function() {
    this.initTimePickerArray();
  },

  // 初始化时间选择器数组
  initTimePickerArray() {
    const date = new Date();
    const years = [];
    const months = [];
    const days = [];
    const hours = [];
    const minutes = [];
    
    // 生成年份选项（当前年份和下一年）
    const currentYear = date.getFullYear();
    years.push(currentYear.toString());
    years.push((currentYear + 1).toString());
    
    // 生成月份选项
    for (let i = 1; i <= 12; i++) {
      months.push(i < 10 ? `0${i}` : `${i}`);
    }
    
    // 生成日期选项
    for (let i = 1; i <= 31; i++) {
      days.push(i < 10 ? `0${i}` : `${i}`);
    }
    
    // 生成小时选项
    for (let i = 0; i < 24; i++) {
      hours.push(i < 10 ? `0${i}` : `${i}`);
    }
    
    // 生成分钟选项
    for (let i = 0; i < 60; i += 5) {
      minutes.push(i < 10 ? `0${i}` : `${i}`);
    }
    
    this.setData({
      timeArray: [years, months, days, hours, minutes],
      timeIndex: [0, date.getMonth(), date.getDate() - 1, date.getHours(), Math.floor(date.getMinutes() / 5)]
    });
  }
}); 