// 引入一码通服务
const qrCodeService = require('../../utils/qrCodeService');
const authService = require('../../utils/authService');

Page({
  data: {
    qrId: '',
    qrImagePath: '',
    isLoading: true,
    errorMsg: '',
    showAuthButton: false, // 是否显示授权按钮
    isLoggedIn: false // 添加登录状态
  },
  
  onLoad() {
    // 检查登录状态
    const isLoggedIn = authService.checkLogin();
    this.setData({ isLoggedIn });
    if (isLoggedIn) {
      this.getQrCode();
    }
  },
  
  // 获取二维码
  getQrCode() {
    console.log('=== 开始获取二维码流程 ===');
    this.setData({
      isLoading: true,
      errorMsg: '',
      showAuthButton: false
    });
    
    // 检查登录状态
    const isLoggedIn = authService.checkLogin();
    console.log('登录状态:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('用户未登录，显示授权按钮');
      this.setData({
        isLoading: false,
        showAuthButton: true
      });
    } else {
      console.log('用户已登录，开始获取二维码');
      this.fetchQrCode();
    }
  },
  
  // 获取一码通二维码
  fetchQrCode() {
    // 开始加载动画
    this.setData({
      isLoading: true,
      errorMessage: '' // 重置错误信息
    });
    
    console.log('===== 开始获取二维码流程 =====');
    console.log('当前登录状态:', wx.getStorageSync('userInfo') ? '已登录' : '未登录');
    console.log('当前选择的小区:', wx.getStorageSync('selectedCommunity'));
    
    qrCodeService
      .getQrCode()
      .then((data) => {
        console.log('获取二维码成功:', data);
        // 保存二维码ID
        this.setData({
          qrId: data.id || data,
          errorMessage: '',
          isLoading: false
        });
        // 生成二维码图片
        this.generateQrCodeImage(data.id || data);
      })
      .catch((err) => {
        console.error('获取二维码失败:', err);
        
        // 停止加载动画
        this.setData({
          isLoading: false
        });
        
        let errorMessage = '获取二维码失败，请稍后重试';
        let shouldRedirect = false;
        
        // 详细打印错误信息
        if (err) {
          console.log('错误类型:', typeof err);
          if (typeof err === 'object') {
            console.log('错误对象详情:', JSON.stringify(err));
          }
        }
        
        // 检查是否是因为未登录而失败
        if (err && typeof err === 'object' && err.message === '未登录') {
          this.setData({
            isLoggedIn: false,
            showAuthButton: true
          });
          return; // 不显示错误消息，因为已经显示了授权按钮
        }
        
        // 检查是否是因为未选择小区而失败
        if (err && typeof err === 'object') {
          if (err.message === '请先选择小区' || 
              (err.msg && (err.msg.includes('请先选择小区') || err.msg.includes('未识别到当前小区')))) {
            console.log('错误原因: 未选择小区或小区ID无效');
            errorMessage = '请先在首页选择您所在的小区';
            shouldRedirect = true;
          }
        }
        
        // 显示错误信息
        this.setData({
          errorMessage: errorMessage
        });
        
        // 如果需要重定向到首页选择小区
        if (shouldRedirect) {
          wx.showModal({
            title: '提示',
            content: errorMessage,
            showCancel: false,
            success(res) {
              if (res.confirm) {
                // 跳转到首页
                wx.switchTab({
                  url: '/pages/index/index'
                });
              }
            }
          });
        }
      });
  },
  
  // 生成二维码图片
  generateQrCodeImage(qrId) {
    console.log('=== 开始生成二维码图片 ===');
    console.log('二维码ID:', qrId);
    
    if (!qrId) {
      console.error('没有二维码ID，无法生成图片');
      this.setData({
        isLoading: false,
        errorMessage: '获取二维码失败，请重试'
      });
      return;
    }
    
    this.setData({ isLoading: true });
    
    qrCodeService.generateQRCode(qrId)
      .then(imagePath => {
        console.log('生成二维码图片成功，图片路径:', imagePath);
        this.setData({
          qrImagePath: imagePath,
          isLoading: false
        });
      })
      .catch(err => {
        console.error('生成二维码图片失败:', err);
        // 使用备用方法
        const backupQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrId)}`;
        console.log('使用备用二维码URL:', backupQrUrl);
        
        this.setData({
          qrImagePath: backupQrUrl,
          isLoading: false
        });
      });
  },
  
  // 导航返回
  navigateBack() {
    wx.navigateBack();
  },
  
  // 授权按钮点击事件处理函数
  async handleAuthLogin() {
    console.log('开始授权登录流程');
    try {
      wx.showLoading({ 
        title: '登录中...',
        mask: true
      });
      
      // 先尝试获取登录凭证
      console.log('尝试获取登录凭证');
      const code = await authService.getLoginCode();
      console.log('获取登录凭证成功:', code);
      
      // 再获取用户信息
      console.log('尝试获取用户信息');
      const userInfo = await authService.getUserProfile();
      console.log('获取用户信息成功:', userInfo);
      
      // 最后进行登录
      console.log('开始登录请求');
      const result = await authService.loginWithCodeAndUserInfo(code, userInfo);
      console.log('登录成功:', result);
      
      wx.hideLoading();
      if (result && result.token) {
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
        
        // 登录成功后获取二维码
        await this.getQrCode();
      }
    } catch (error) {
      console.error('登录过程出错:', error);
      wx.hideLoading();
      
      // 根据错误类型显示不同的提示
      let errorMessage = '登录失败，请重试';
      if (error.message.includes('getUserProfile:fail')) {
        errorMessage = '获取用户信息失败，请重新授权';
      } else if (error.message.includes('微信登录失败')) {
        errorMessage = '微信登录失败，请检查网络后重试';
      }
      
      wx.showModal({
        title: '登录失败',
        content: errorMessage,
        showCancel: false
      });
    }
  },
  
  // 刷新二维码
  refreshQrCode() {
    wx.showLoading({
      title: '刷新中...',
      mask: true
    });
    this.getQrCode();
    setTimeout(() => {
      wx.hideLoading();
    }, 1500);
  },
  
  // 处理图片加载错误
  handleImageError(e) {
    console.error('二维码图片加载失败:', e);
    const backupQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(this.data.qrId)}`;
    this.setData({
      qrImagePath: backupQrUrl
    });
  },
  
  // 修改授权处理函数
  handleGetUserInfo(e) {
    console.log('获取用户信息回调:', e);
    
    // 用户拒绝授权
    if (!e.detail.userInfo) {
      wx.showModal({
        title: '提示',
        content: '您已拒绝授权，将以游客身份登录',
        showCancel: false,
        success: () => {
          // 使用仅有code的登录方式
          this.loginWithCodeOnly();
        }
      });
      return;
    }
    
    // 用户同意授权，开始登录流程
    this.loginWithUserInfo(e.detail);
  },
  
  // 使用用户信息登录
  async loginWithUserInfo(userInfo) {
    try {
      wx.showLoading({ title: '登录中...', mask: true });
      
      // 获取登录码
      const code = await authService.getLoginCode();
      console.log('获取到登录码:', code);
      
      // 执行登录
      const result = await authService.loginWithCodeAndUserInfo(code, userInfo);
      
      wx.hideLoading();
      if (result && result.token) {
        wx.showToast({ title: '登录成功', icon: 'success' });
        this.getQrCode(); // 获取二维码
      }
    } catch (error) {
      wx.hideLoading();
      console.error('登录失败:', error);
      wx.showModal({
        title: '登录失败',
        content: error.message || '请稍后重试',
        showCancel: false
      });
    }
  },
  
  // 仅使用code登录(无用户信息)
  async loginWithCodeOnly() {
    try {
      wx.showLoading({ title: '登录中...', mask: true });
      
      // 获取登录码
      const code = await authService.getLoginCode();
      console.log('获取到登录码:', code);
      
      // 严格按照API文档构造数据
      const requestData = {
        code: code || "",
        rawData: "",
        signature: ""
      };
      
      console.log('发送的基础登录请求数据:', JSON.stringify(requestData));
      
      // 执行登录
      wx.request({
        url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/user/login',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Host': 'property-func-dcwdljroao.cn-shenzhen.fcapp.run',
          'Connection': 'keep-alive'
        },
        data: requestData,
        success: (res) => {
          wx.hideLoading();
          console.log('基础登录响应:', res);
          
          if (res.statusCode === 200 && res.data && res.data.code === "200") {
            const token = res.data.data || "";
            if (!token) {
              throw new Error('服务器返回的token为空');
            }
            
            // 保存token
            wx.setStorageSync('token', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
            
            wx.showToast({ title: '登录成功', icon: 'success' });
            this.getQrCode(); // 获取二维码
          } else if (res.statusCode >= 500) {
            console.error('服务器内部错误:', res.data);
            wx.showModal({
              title: '登录失败',
              content: '服务器暂时不可用，请稍后再试',
              showCancel: false
            });
          } else {
            wx.showModal({
              title: '登录失败',
              content: (res.data && res.data.msg) || '请稍后重试',
              showCancel: false
            });
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('登录请求失败:', err);
          wx.showModal({
            title: '登录失败',
            content: '网络请求失败，请检查网络连接',
            showCancel: false
          });
        },
        enableHttp2: false,
        enableQuic: false,
        enableCache: false
      });
    } catch (error) {
      wx.hideLoading();
      console.error('登录失败:', error);
      wx.showModal({
        title: '登录失败',
        content: error.message || '请稍后重试',
        showCancel: false
      });
    }
  }
});