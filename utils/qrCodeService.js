/**
 * 一码通服务
 * 封装与一码通相关的所有接口请求
 */

// 引入认证服务
const authService = require('./authService');
const app = getApp();
const request = require('./request'); // 假设您有一个请求工具

/**
 * 获取一码通二维码
 * 调用后端接口获取一码通二维码内容
 * @returns {Promise} 包含二维码数据的Promise
 */
const getQrCode = () => {
  return new Promise((resolve, reject) => {
    const token = authService.getToken();
    
    if (!token) {
      reject(new Error('未登录'));
      return;
    }
    
    wx.request({
      url: 'https://property.suyiiyii.top/qrcode/get',
      method: 'POST',
      header: {
        'Authorization': token,
        'Accept': '*/*',
        'Host': 'property.suyiiyii.top',
        'Connection': 'keep-alive'
      },
      success: (res) => {
        console.log('获取二维码响应:', res);
        if (res.statusCode === 200 && res.data.code === "200") {
          resolve(res.data.data);
        } else if (res.statusCode === 401 || res.data.code === "401") {
          reject({
            code: 401,
            message: '登录已过期，请重新登录'
          });
        } else {
          reject({
            code: res.data.code,
            message: res.data.msg || '获取二维码失败'
          });
        }
      },
      fail: (err) => {
        reject({
          code: -1,
          message: '网络连接失败'
        });
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
    
    wx.request({
      url: 'https://property.suyiiyii.top/qrcode/refresh',
      method: 'POST',  // 根据接口规范使用POST方法
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401 || (res.data && res.data.code === "401")) {
          // token失效，尝试刷新token
          refreshToken()
            .then(newToken => {
              // 使用新token重试请求
              return refreshQrCode();
            })
            .catch(refreshError => {
              // 刷新token失败，需要重新登录
              navigateToLogin();
              reject({
                code: 401,
                message: '登录已过期'
              });
            });
        } else {
          reject({
            code: res.data?.code || res.statusCode,
            message: res.data?.msg || '请求失败'
          });
        }
      },
      fail: (err) => {
        reject({
          code: -1,
          message: '网络连接失败'
        });
      }
    });
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
    
    wx.request({
      url: 'https://property.suyiiyii.top/qrcode/verify',
      method: 'POST',  // 修改为 GET 方法
      data: { qrId },  // GET 请求参数会自动转换为查询字符串
      header: authService.getAuthHeader(),
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401 || (res.data && res.data.code === "401")) {
          // token失效，需要重新登录
          wx.showModal({
            title: '提示',
            content: '登录已过期，请重新登录',
            showCancel: false,
            success: () => {
              wx.removeStorageSync('token');
              wx.navigateTo({
                url: '/pages/login/login'
              });
            }
          });
          reject(new Error('登录已过期'));
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
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

// 导出函数
module.exports = {
  getQrCode,
  refreshQrCode,
  verifyQrCode
};