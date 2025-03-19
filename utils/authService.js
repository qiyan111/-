/**
 * 认证服务
 * 处理用户登录、注册、token管理等认证相关功能
 */

const app = getApp();

/**
 * 获取微信登录凭证
 * @returns {Promise} 包含登录凭证的Promise
 */
const getLoginCode = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(new Error('获取登录凭证失败'));
        }
      },
      fail: (err) => {
        reject(new Error('微信登录失败，请重试'));
      }
    });
  });
};

/**
 * 使用登录凭证和用户信息登录
 * @param {String} code - 登录凭证
 * @param {Object} userInfo - 用户信息
 * @returns {Promise} 包含登录结果的Promise
 */
const loginWithCodeAndUserInfo = (code, userInfo) => {
  return new Promise((resolve, reject) => {
    console.log('开始登录请求，参数:', { code, userInfo });
    wx.request({
      url: `https://property.suyiiyii.top/user/login?code=${code}&rawData=${encodeURIComponent(userInfo.rawData)}&signature=${encodeURIComponent(userInfo.signature)}`,
      method: 'POST',
      header: {
        'Accept': '*/*',
        'Host': 'property.suyiiyii.top',
        'Connection': 'keep-alive'
      },
      success: (res) => {
        console.log('登录响应:', res);
        if (res.statusCode === 200 && res.data.code === "200") {
          // 保存 token
          const token = res.data.data;
          wx.setStorageSync('token', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
          wx.setStorageSync('userInfo', userInfo.userInfo);
          resolve({ token });
        } else {
          reject(new Error(res.data.msg || '登录失败'));
        }
      },
      fail: (err) => {
        console.error('登录请求失败:', err);
        reject(new Error('网络请求失败，请检查网络连接'));
      }
    });
  });
};

/**
 * 检查登录状态
 * 验证当前用户是否已登录
 * @returns {Boolean} 是否已登录
 */
const checkLoginStatus = () => {
  const token = wx.getStorageSync('token');
  console.log('检查登录状态，token:', token ? '存在' : '不存在');
  return !!token; // 转换为布尔值
};

/**
 * 退出登录
 * 清除本地存储的登录信息
 */
const logout = () => {
  console.log('执行退出登录');
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
  // 可以添加退出登录的API请求
};

/**
 * 获取认证头信息
 * 用于API请求时添加认证信息
 * @returns {Object} 包含Authorization的头信息对象
 */
const getAuthHeader = () => {
  const token = wx.getStorageSync('token');
  return {
    'Authorization': token,
    'Accept': '*/*',
    'Host': 'property.suyiiyii.top',
    'Connection': 'keep-alive'
  };
};

// 登录服务
const login = () => {
  return new Promise((resolve, reject) => {
    // 先调用 wx.login 获取 code
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          // 获取用户信息
          wx.getUserProfile({
            desc: '需要您的授权才能使用开门功能',
            success: (userRes) => {
              console.log('获取用户信息成功:', userRes);
              // 将 code、rawData 和 signature 发送给后端
              wx.request({
                url: 'https://property.suyiiyii.top/user/login',
                method: 'POST',
                data: {
                  code: loginRes.code,
                  rawData: userRes.rawData,
                  signature: userRes.signature,
                  encryptedData: userRes.encryptedData,
                  iv: userRes.iv
                },
                success: (res) => {
                  console.log('登录响应:', res);
                  if (res.statusCode === 200 && res.data.code === 200) {
                    // 保存 token
                    const token = res.data.data.token;
                    wx.setStorageSync('token', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
                    wx.setStorageSync('userInfo', userRes.userInfo);
                    resolve(res.data.data);
                  } else {
                    reject(new Error(res.data.msg || '登录失败'));
                  }
                },
                fail: (err) => {
                  console.error('登录请求失败:', err);
                  reject(new Error('网络请求失败，请检查网络连接'));
                }
              });
            },
            fail: (err) => {
              console.error('获取用户信息失败:', err);
              reject(new Error('您需要授权才能使用开门功能'));
            }
          });
        } else {
          reject(new Error('获取登录凭证失败，请重试'));
        }
      },
      fail: (err) => {
        console.error('wx.login 失败:', err);
        reject(new Error('微信登录失败，请重试'));
      }
    });
  });
};

// 检查是否已登录
const checkLogin = () => {
  const token = wx.getStorageSync('token');
  return !!token;
};

// 获取 token
const getToken = () => {
  const token = wx.getStorageSync('token');
  console.log('从存储获取的 token:', token);  // 添加日志
  return token;
};

// 保存 token
const setToken = (token) => {
  console.log('保存 token:', token);  // 添加日志
  wx.setStorageSync('token', token);
};

module.exports = {
  getLoginCode,
  loginWithCodeAndUserInfo,
  checkLoginStatus,
  logout,
  getAuthHeader,
  login,
  checkLogin,
  getToken,
  setToken
}; 