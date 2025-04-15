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
    console.log('开始获取登录凭证...');
    wx.login({
      timeout: 10000, // 设置超时时间
      success: (res) => {
        console.log('wx.login 成功:', res);
        if (res.code) {
          resolve(res.code);
        } else {
          console.error('wx.login 返回异常:', res);
          reject(new Error('获取登录凭证失败'));
        }
      },
      fail: (err) => {
        console.error('wx.login 失败，详细错误:', err);
        reject(new Error(`微信登录失败: ${err.errMsg}`));
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
const loginWithCodeAndUserInfo = async (code, userInfo) => {
  try {
    console.log('开始登录请求，参数:', { code, userInfo });
    
    // 确保参数类型正确
    const requestData = {
      code: code || "",
      rawData: (userInfo && userInfo.rawData) || "",
      signature: (userInfo && userInfo.signature) || ""
    };
    
    console.log('发送的请求数据:', JSON.stringify(requestData));

    const response = await new Promise((resolve, reject) => {
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
          console.log('登录响应详情:', res);
          resolve(res);
        },
        fail: (err) => {
          console.error('请求失败:', err);
          reject(err);
        },
        enableHttp2: false,
        enableQuic: false,
        enableCache: false
      });
    });

    // 检查响应状态
    if (!response.data) {
      throw new Error('服务器响应异常');
    }

    // 检查服务器错误状态码
    if (response.statusCode >= 500) {
      console.error('服务器内部错误:', response.data);
      throw new Error('服务器暂时不可用，请稍后再试');
    }

    console.log('登录响应数据:', response.data);
    
    if (response.statusCode === 200 && response.data.code === "200") {
      const token = response.data.data || "";
      if (!token) {
        throw new Error('服务器返回的token为空');
      }
      
      // 保存token
      wx.setStorageSync('token', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
      
      // 保存用户信息
      if (userInfo && userInfo.userInfo) {
        wx.setStorageSync('userInfo', userInfo.userInfo);
      }
      
      return { token };
    } else {
      throw new Error(response.data.msg || '登录失败，请重试');
    }
  } catch (error) {
    console.error('登录请求处理失败:', error);
    if (error.errMsg && error.errMsg.includes('request:fail')) {
      throw new Error('网络连接失败，请检查网络');
    }
    throw error;
  }
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
 */
const getAuthHeader = () => {
  const token = wx.getStorageSync('token');
  return {
    'Authorization': token,
    'Accept': '*/*',
    'Host': 'property-func-dcwdljroao.cn-shenzhen.fcapp.run',
    'Connection': 'keep-alive'
  };
};

/**
 * 获取用户信息
 * @returns {Promise} 包含用户信息的Promise
 */
const getUserProfile = () => {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      lang: 'zh_CN',
      success: (res) => {
        console.log('获取用户信息成功:', res);
        resolve(res);
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        reject(new Error('获取用户信息失败，请重新授权'));
      }
    });
  });
};

/**
 * 完整的登录流程
 */
const login = async () => {
  try {
    console.log('开始完整登录流程');
    // 先获取登录码
    const code = await getLoginCode();
    console.log('获取到登录码:', code);
    
    // 获取用户信息
    const userInfo = await getUserProfile();
    console.log('获取到用户信息:', userInfo);
    
    // 执行登录
    const loginResult = await loginWithCodeAndUserInfo(code, userInfo);
    console.log('登录成功:', loginResult);
    
    return loginResult;
  } catch (error) {
    console.error('登录流程失败:', error);
    throw error;
  }
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
  setToken,
  getUserProfile
}; 