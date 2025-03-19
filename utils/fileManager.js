// 文件管理工具类

/**
 * 获取文件上传地址
 * @param {String} fileName 文件名称
 * @returns {Promise} 返回上传地址相关信息
 */
function getUploadUrl(fileName) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/getUploadUrl',
      method: 'POST',
      data: {
        fileName: fileName,
        fileType: '',
        fileSize: '',
      },
      header: {
        'content-type': 'application/json',
        // 如果需要认证信息，在这里添加
        'Authorization': wx.getStorageSync('token') || ''
      },
      success(res) {
        if (res.statusCode === 200 && res.data) {
          // 根据后端实际返回的数据结构进行调整
          // 例如，如果后端返回 { code: 0, data: { uploadUrl: "url" } }
          if (res.data.code === 0) {
            resolve(res.data.data);
          } else {
            reject(new Error(res.data.message || '获取上传地址失败'));
          }
        } else {
          reject(new Error('获取上传地址失败'));
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

/**
 * 上传文件
 * @param {String} filePath 本地文件路径
 * @param {String} fileName 文件名
 * @returns {Promise} 上传结果
 */
function uploadFile(filePath, fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. 获取上传地址
      const uploadInfo = await getUploadUrl(fileName);
      
      // 2. 使用uploadFile上传文件
      wx.uploadFile({
        url: uploadInfo.uploadUrl, // 后端返回的上传地址
        filePath: filePath,
        name: 'file', // 文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容
        formData: uploadInfo.formData || {}, // 如果后端需要额外参数
        header: uploadInfo.header || {},
        success(res) {
          if (res.statusCode === 200) {
            // 可能需要解析返回的数据
            let data = res.data;
            if (typeof data === 'string') {
              try {
                data = JSON.parse(data);
              } catch (e) {
                // 解析失败，保持原样
              }
            }
            resolve(data);
          } else {
            reject(new Error(`上传失败，状态码: ${res.statusCode}`));
          }
        },
        fail(err) {
          reject(err);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 获取文件下载地址
 * @param {String} fileId 文件ID或路径
 * @returns {Promise} 返回下载地址
 */
function getDownloadUrl(fileId) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/getDownloadUrl', // 添加具体的接口路径
      method: 'GET',
      data: {
        fileId: fileId
      },
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync('token') || ''
      },
      success(res) {
        if (res.statusCode === 200 && res.data) {
          resolve(res.data);
        } else {
          reject(new Error('获取下载地址失败'));
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
}

/**
 * 下载文件到本地
 * @param {String} fileId 文件ID
 * @returns {Promise} 下载结果
 */
function downloadFile(fileId) {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. 获取下载地址
      const downloadInfo = await getDownloadUrl(fileId);
      
      // 2. 下载文件
      wx.downloadFile({
        url: downloadInfo.downloadUrl,
        header: downloadInfo.header || {},
        success(res) {
          if (res.statusCode === 200) {
            resolve({
              tempFilePath: res.tempFilePath,
              fileType: downloadInfo.fileType || ''
            });
          } else {
            reject(new Error(`下载失败，状态码: ${res.statusCode}`));
          }
        },
        fail(err) {
          reject(err);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  getUploadUrl,
  uploadFile,
  getDownloadUrl,
  downloadFile
}; 