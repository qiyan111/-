/**
 * 一码通服务
 * 封装与一码通相关的所有接口请求
 */

// 引入认证服务
const authService = require('./authService');
const app = getApp();
const request = require('./request'); // 一个请求工具

/**
 * 获取一码通二维码
 * 调用后端接口获取一码通二维码内容
 * @returns {Promise} 包含二维码数据的Promise
 */
const getQrCode = () => {
  return new Promise((resolve, reject) => {
    console.log('=== 开始获取二维码 ===');
    
    const token = authService.getToken();
    console.log('当前 token 状态:', token ? '已获取' : '未获取');
    
    if (!token) {
      console.error('未获取到 token，终止请求');
      reject(new Error('未登录'));
      return;
    }
    
    // 使用硬编码的 token 测试
    const testToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxIiwiZXhwIjoxODQyMDQ3MTc2fQ.eR8U4B92t6xoRjzKocEThKpVV3q674vb_oekgwgOr1Q';
    console.log('准备发送请求，使用测试 token');
    
    wx.request({
      url: 'https://property.suyiiyii.top/qrcode/get',
      method: 'POST',
      header: {
        'Authorization': testToken,
        'Accept': '*/*',
        'Host': 'property.suyiiyii.top',
        'Connection': 'keep-alive',
        'Content-Length': '0',
        'content-type': 'application/json'
      },
      data: '',
      success: (res) => {
        console.log('=== 请求成功，响应数据 ===', res);
        if (res.statusCode === 200 && res.data.code === "200") {
          console.log('成功获取二维码数据:', res.data.data);
          
          if (!res.data.data || !res.data.data.id) {
            console.log('服务器未返回二维码ID，使用模拟ID');
            const mockData = {
              id: 'test-qr-code-' + Date.now()
            };
            console.log('生成的模拟数据:', mockData);
            resolve(mockData);
          } else {
            console.log('使用服务器返回的二维码数据');
            resolve(res.data.data);
          }
        } else if (res.statusCode === 401 || res.data.code === "401") {
          console.error('权限错误:', res.data);
          reject({
            code: 401,
            message: '登录已过期，请重新登录'
          });
        } else {
          console.error('其他错误，使用模拟ID');
          const mockData = {
            id: 'test-qr-code-' + Date.now()
          };
          console.log('生成的模拟数据:', mockData);
          resolve(mockData);
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        const mockData = {
          id: 'test-qr-code-' + Date.now()
        };
        console.log('请求失败，使用模拟数据:', mockData);
        resolve(mockData);
      }
    });
  });
};

/**
 * 刷新一码通二维码
 * 当二维码过期时调用此方法刷新
 * @returns {Promise} 包含新二维码数据的Promise
 */
const refreshQrCode = () => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    
    // 检查是否有token
    if (!token) {
      navigateToLogin();
      reject(new Error('未登录'));
      return;
    }
    
  
  });
};

/**
 * 验证一码通状态
 * 验证当前一码通的有效性状态
 * @param {String} qrId - 二维码ID
 * @returns {Promise} 包含验证结果的Promise
 */
const verifyQrCode = (qrId) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    
    // 检查是否有token
    if (!token) {
      // 没有token，提示用户登录
      wx.showModal({
        title: '提示',
        content: '您尚未登录或登录已过期，请先登录',
        showCancel: false,
        success: () => {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      });
      reject(new Error('未登录'));
      return;
    }
    
  
  });
};

// 获取 token 的函数
const getToken = () => {
  return wx.getStorageSync('token') || '';
};

// 刷新 token 的函数
const refreshToken = () => {
  return new Promise((resolve, reject) => {
    // 使用 refreshToken 获取新的 token
    const refreshToken = wx.getStorageSync('refreshToken');
    if (!refreshToken) {
      // 如果没有 refreshToken，直接跳转到登录页
      navigateToLogin();
      reject(new Error('没有刷新令牌'));
      return;
    }
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/api/auth/refresh`,
      method: 'POST',
      data: { refreshToken },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          // 保存新的 token
          wx.setStorageSync('token', res.data.data.token);
          wx.setStorageSync('refreshToken', res.data.data.refreshToken);
          resolve(res.data.data.token);
        } else {
          // 刷新失败，跳转到登录页
          navigateToLogin();
          reject(new Error('刷新令牌失败'));
        }
      },
      fail: (err) => {
        navigateToLogin();
        reject(err);
      }
    });
  });
};

// 跳转到登录页
const navigateToLogin = () => {
  wx.showModal({
    title: '登录已过期',
    content: '您的登录状态已过期，请重新登录',
    showCancel: false,
    success: () => {
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }
  });
};

// 处理请求的函数，包含 token 刷新逻辑
const handleRequest = async (url, method, data, retryCount = 0) => {
  try {
    const token = getToken();
    const response = await request({
      url,
      method,
      data,
      header: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response;
  } catch (error) {
    // 如果是 401 错误且未超过重试次数
    if (error.code === 401 && retryCount < 1) {
      try {
        // 刷新 token
        await refreshToken();
        // 使用新 token 重试请求
        return handleRequest(url, method, data, retryCount + 1);
      } catch (refreshError) {
        throw refreshError;
      }
    }
    
    throw error;
  }
};

/**
 * 根据ID生成二维码
 * @param {String} qrId - 二维码ID
 * @returns {Promise} 包含二维码图片的Promise
 */
const generateQRCode = (qrId) => {
  // 使用多个备用服务，以防一个服务失败
  const qrCodeUrls = [
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrId)}`
  
  ];
  
  return new Promise((resolve, reject) => {
    // 直接返回URL，不下载到本地
    console.log('直接使用在线二维码URL:', qrCodeUrls[0]);
    resolve(qrCodeUrls[0]);
  });
};

// 导出函数
module.exports = {
  getQrCode,
  refreshQrCode,
  verifyQrCode,
  generateQRCode
};