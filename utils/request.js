/**
 * 网络请求工具
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data,
      header: options.header || {},
      success: (res) => {
        // 根据后端 API 规范调整
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data.data);
          } else if (res.data.code === 401) {
            // 401 错误，token 验证失败
            reject({
              code: 401,
              message: res.data.msg || 'token验证失败，请重新登录'
            });
          } else {
            // 其他业务错误
            reject({
              code: res.data.code,
              message: res.data.msg || '请求失败'
            });
          }
        } else {
          // HTTP 状态码错误
          reject({
            code: res.statusCode,
            message: '网络请求失败'
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

module.exports = request; 