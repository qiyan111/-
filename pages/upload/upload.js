// 引入文件管理工具
const fileManager = require('../../utils/fileManager');

Page({
  data: {
    fileList: []
  },

  // 选择文件并上传
  chooseAndUploadFile() {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image', 'video', 'mix'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        const fileName = tempFilePath.substring(tempFilePath.lastIndexOf('/') + 1);
        
        // 显示上传中
        wx.showLoading({
          title: '上传中...',
        });
        
        // 上传文件
        fileManager.uploadFile(tempFilePath, fileName)
          .then(result => {
            wx.hideLoading();
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            });
            
            // 更新文件列表
            const fileList = that.data.fileList;
            fileList.push({
              id: result.fileId, // 假设后端返回了文件ID
              name: fileName,
              url: result.fileUrl || ''
            });
            that.setData({ fileList });
          })
          .catch(error => {
            wx.hideLoading();
            wx.showToast({
              title: '上传失败',
              icon: 'error'
            });
            console.error('上传文件失败:', error);
          });
      }
    });
  },
  
  // 预览或下载文件
  previewFile(e) {
    const fileId = e.currentTarget.dataset.id;
    
    wx.showLoading({
      title: '加载中...',
    });
    
    fileManager.getDownloadUrl(fileId)
      .then(downloadInfo => {
        wx.hideLoading();
        
        // 根据文件类型处理预览
        if (downloadInfo.fileType && downloadInfo.fileType.startsWith('image/')) {
          // 预览图片
          wx.previewImage({
            urls: [downloadInfo.downloadUrl],
            current: downloadInfo.downloadUrl
          });
        } else {
          // 下载文件
          wx.downloadFile({
            url: downloadInfo.downloadUrl,
            success(res) {
              if (res.statusCode === 200) {
                // 打开文件
                wx.openDocument({
                  filePath: res.tempFilePath,
                  showMenu: true
                });
              }
            }
          });
        }
      })
      .catch(error => {
        wx.hideLoading();
        wx.showToast({
          title: '获取文件失败',
          icon: 'error'
        });
        console.error('获取文件失败:', error);
      });
  }
}); 