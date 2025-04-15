const app = getApp(); // 获取 App 实例

/**
 * 网络请求工具
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    let requestUrl = options.url;
    
    // 检查 app 和 globalData 是否存在
    console.log('[Request Debug] app:', app ? 'exists' : 'null');
    console.log('[Request Debug] app.globalData:', app && app.globalData ? 'exists' : 'null');
    
    const baseUrl = app && app.globalData ? app.globalData.apiBaseUrl : null;
    console.log('[Request Debug] baseUrl:', baseUrl || 'not found');

    // 如果是相对路径，并且 Base URL 存在，则拼接
    if (requestUrl.startsWith('/') && !requestUrl.startsWith('//') && baseUrl) {
      requestUrl = baseUrl + requestUrl;
      console.log('[Request Debug] URL has been joined with baseUrl');
    } else {
      console.log('[Request Debug] URL not joined because:', 
                  !requestUrl.startsWith('/') ? 'not a relative path' : 
                  requestUrl.startsWith('//') ? 'starts with //' : 
                  !baseUrl ? 'baseUrl not found' : 'unknown reason');
    }
    
    // 硬编码一个临时解决方案 - 添加一个可能的基础URL
    // 这只是为了调试，基于您之前的fetch请求中提供的URL判断
    if (requestUrl.startsWith('/')) {
      requestUrl = 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run' + requestUrl;
      console.log('[Request Debug] URL hard-coded with domain:', requestUrl);
    }

    // 添加日志，打印将要请求的 URL (现在是完整 URL)
    console.log('[Request Util] Requesting URL:', requestUrl);
    
    wx.request({
      url: requestUrl, // 使用拼接后的完整 URL
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