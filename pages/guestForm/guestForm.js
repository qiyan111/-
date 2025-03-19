// 引入访客服务
const guestService = require('../../utils/guestService');

Page({
  data: {
    formData: {
      guestName: '',
      guestPhone: '',
      visitReason: '',
      visitDate: ''
    },
    minDate: '',
    maxDate: '',
    isSubmitting: false,
    guestCodeId: '',
    qrImagePath: ''
  },
  
  onLoad() {
    // 设置日期选择器的范围
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 1);
    
    this.setData({
      minDate,
      maxDate: maxDate.toISOString().split('T')[0]
    });
  },
  
  // 日期选择器变化事件
  bindDateChange(e) {
    this.setData({
      'formData.visitDate': e.detail.value
    });
  },
  
  // 提交表单
  submitForm(e) {
    const formValues = e.detail.value;
    const { guestName, guestPhone, visitReason } = formValues;
    const { visitDate } = this.data.formData;
    
    // 表单验证
    if (!guestName || !guestPhone || !visitReason || !visitDate) {
      wx.showToast({
        title: '请填写完整信息',
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
    
    this.setData({ isSubmitting: true });
    
    // 构建提交数据
    const submitData = {
      guestName,
      guestPhone,
      visitReason,
      visitTime: visitDate
    };
    
    // 提交访客申请
    guestService.submitGuestForm(submitData)
      .then(res => {
        console.log('访客申请提交成功:', res);
        
        // 假设后端返回的数据中包含访客码ID
        const guestCodeId = res.id || 'guest-' + Date.now();
        
        this.setData({
          guestCodeId,
          isSubmitting: false
        });
        
        // 生成访客二维码
        return this.generateGuestQRCode(guestCodeId);
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
  
  // 生成访客二维码
  generateGuestQRCode(guestCodeId) {
    guestService.generateGuestQRCode(guestCodeId)
      .then(qrImagePath => {
        console.log('生成访客二维码成功:', qrImagePath);
        this.setData({ qrImagePath });
      })
      .catch(err => {
        console.error('生成访客二维码失败:', err);
        wx.showToast({
          title: '生成二维码失败',
          icon: 'none'
        });
      });
  },
  
  // 处理图片加载错误
  handleImageError(e) {
    console.error('二维码图片加载失败:', e);
    const backupUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(this.data.guestCodeId)}`;
    this.setData({
      qrImagePath: backupUrl
    });
  },
  
  // 导航返回
  navigateBack() {
    wx.navigateBack();
  }
});