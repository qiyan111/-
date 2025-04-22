Page({
  data: {
    // 顶部 4 个 Tab
    tabs: [
      { name: '报事申请', page: '/pages/repair/prerepair' },
      { name: '待受理', page: '/pages/repair/repair_list' },
      { name: '处理中', page: '/pages/repair/repairing' },
      { name: '已完成', page: '/pages/repair/repaired' }
    ],
    activeTab: 0,

    // 标题字体大小
    titleFontSize: '36rpx',

    // 添加上传图片数组
    uploadedImages: [],
    // 存储上传后的图片key
    problemImageKeys: [],

    // 表单字段
    houseNumber: '',
    emergencyLevel: '',  // "低" | "中" | "高"
    repairArea: '公共区域',  // "户内" | "公共区域"
    description: '',
    contactName: '',
    contactPhone: '',
    expectedDate: 'YYYY - MM - DD',  // 初始占位
    timeSlots: ['8-12点', '14-18点'],
    selectedTimeSlot: '',

    // 紧急程度图片路径
    emergencyImages: {
      '低': '/images/repair/low.png',
      '中': '/images/repair/mid.png',
      '高': '/images/repair/high.png'
    },
    
    // 待受理维修列表 - 用于Tab 1
    pendingOrders: [],
    
    // 处理中维修列表 - 用于Tab 2
    processingOrders: [],
    
    // 已完成维修列表 - 用于Tab 3
    completedOrders: []
  },

  onLoad() {
    // 默认只加载当前tab的数据
    if (this.data.activeTab === 1) {
      this.loadPendingOrders();
    } else if (this.data.activeTab === 2) {
      this.loadProcessingOrders();
    } else if (this.data.activeTab === 3) {
      this.loadCompletedOrders();
    }
  },

  onTabClick(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
  
    // 切换tab时，加载对应数据
    if (index === 1) {
      this.loadPendingOrders();
    } else if (index === 2) {
      this.loadProcessingOrders();
    } else if (index === 3) {
      this.loadCompletedOrders();
    }
    // 报事申请tab不需要请求
  },

  // 修改加载待受理工单函数
  // 获取 communityId 的统一方法
  getCommunityId() {
    const selectedCommunity = wx.getStorageSync('selectedCommunity');
    console.log('getCommunityId 读取到:', selectedCommunity);
    return selectedCommunity && selectedCommunity.id ? selectedCommunity.id.toString() : '';
  },
  
  // 修改所有 header 里 communityId 的写法
  loadPendingOrders() {
    wx.showLoading({
      title: '加载中...',
    });
  
    wx.request({
      url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/repairOrder/getOrder',
      method: 'GET',
      data: {
        orderStatus: '待受理'
      },
      header: {
        'content-type': 'application/json',
        'Authorization': (wx.getStorageSync('token') || ''),
        'communityId': this.getCommunityId() // 统一获取
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data && res.data.code === '200') {
          // 处理返回的数据，格式化日期等
          const orders = res.data.data.map(item => {
            // 将时间戳转换为可读日期
            let expectedDate = '未设置';
            let timeSlot = '';
            
            if (item.expectedVisitTime) {
              // 如果是时间戳格式
              if (typeof item.expectedVisitTime === 'number') {
                const date = new Date(item.expectedVisitTime);
                expectedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              } else {
                // 如果已经是日期字符串
                expectedDate = item.expectedVisitTime;
              }
              
              // 假设时间段信息可能存储在其他字段或需要解析
              // 这里简单处理，实际情况可能需要调整
              if (expectedDate.includes('8-12') || expectedDate.includes('14-18')) {
                const parts = expectedDate.split(' ');
                expectedDate = parts[0];
                timeSlot = parts[1] || '';
              }
            }
            
            return {
              id: item.id,
              orderNumber: item.id.toString(), // 使用id作为订单号
              status: '待受理',
              repairArea: item.repairArea,
              description: item.problemDescription,
              createTime: item.createTime || '未知',
              emergencyLevel: item.urgency,
              expectedDate: expectedDate,
              timeSlot: timeSlot,
              contactName: item.contactName,
              contactPhone: item.contactPhone,
              problemImageKeys: item.problemImageKeys || []
            };
          });
          
          this.setData({
            pendingOrders: orders
          });
        } else {
          wx.showToast({
            title: res.data?.msg || '获取数据失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('获取待受理工单失败', err);
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      }
    });
  },

  // 修改加载处理中工单函数
  loadProcessingOrders() {
    wx.showLoading({
      title: '加载中...',
    });
    
    wx.request({
      url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/repairOrder/getOrder',
      method: 'GET',
      data: {
        orderStatus: '处理中'
      },
      header: {
        'content-type': 'application/json',
        'Authorization': (wx.getStorageSync('token') || ''),
        'communityId': this.getCommunityId()
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data && res.data.code === '200') {
          // 处理返回的数据，格式化日期等
          const orders = res.data.data.map(item => {
            // 将时间戳转换为可读日期
            let expectedDate = '未设置';
            let timeSlot = '';
            
            if (item.expectedVisitTime) {
              // 如果是时间戳格式
              if (typeof item.expectedVisitTime === 'number') {
                const date = new Date(item.expectedVisitTime);
                expectedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              } else {
                // 如果已经是日期字符串
                expectedDate = item.expectedVisitTime;
              }
              
              // 假设时间段信息可能存储在其他字段或需要解析
              if (expectedDate.includes('8-12') || expectedDate.includes('14-18')) {
                const parts = expectedDate.split(' ');
                expectedDate = parts[0];
                timeSlot = parts[1] || '';
              }
            }
            
            return {
              id: item.id,
              orderNumber: item.id.toString(), // 使用id作为订单号
              status: '处理中',
              repairArea: item.repairArea,
              description: item.problemDescription,
              createTime: item.createTime || '未知',
              emergencyLevel: item.urgency,
              expectedDate: expectedDate,
              timeSlot: timeSlot,
              contactName: item.contactName,
              contactPhone: item.contactPhone,
              problemImageKeys: item.problemImageKeys || [],
              repairManName: item.repairManName || '维修人员',
              repairManPhone: item.repairManPhone || ''
            };
          });
          
          this.setData({
            processingOrders: orders
          });
        } else {
          wx.showToast({
            title: res.data?.msg || '获取数据失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('获取处理中工单失败', err);
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      }
    });
  },

  // 修改加载已完成工单函数
  loadCompletedOrders() {
    wx.showLoading({
      title: '加载中...',
    });
    
    wx.request({
      url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/repairOrder/getOrder',
      method: 'GET',
      data: {
        orderStatus: '已完成'
      },
      header: {
        'content-type': 'application/json',
        'Authorization': (wx.getStorageSync('token') || ''),
        'communityId': this.getCommunityId()
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data && res.data.code === '200') {
          // 处理返回的数据，格式化日期等
          const orders = res.data.data.map(item => {
            // 将时间戳转换为可读日期
            let expectedDate = '未设置';
            let timeSlot = '';
            
            if (item.expectedVisitTime) {
              // 如果是时间戳格式
              if (typeof item.expectedVisitTime === 'number') {
                const date = new Date(item.expectedVisitTime);
                expectedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              } else {
                // 如果已经是日期字符串
                expectedDate = item.expectedVisitTime;
              }
              
              // 假设时间段信息可能存储在其他字段或需要解析
              if (expectedDate.includes('8-12') || expectedDate.includes('14-18')) {
                const parts = expectedDate.split(' ');
                expectedDate = parts[0];
                timeSlot = parts[1] || '';
              }
            }
            
            return {
              id: item.id,
              orderNumber: item.id.toString(), // 使用id作为订单号
              status: '已完成',
              repairArea: item.repairArea,
              description: item.problemDescription,
              createTime: item.createTime || '未知',
              completeTime: item.completeTime || '未知',
              emergencyLevel: item.urgency,
              expectedDate: expectedDate,
              timeSlot: timeSlot,
              contactName: item.contactName,
              contactPhone: item.contactPhone,
              problemImageKeys: item.problemImageKeys || [],
              repairManName: item.repairManName || '维修人员',
              repairManPhone: item.repairManPhone || ''
            };
          });
          
          this.setData({
            completedOrders: orders
          });
        } else {
          wx.showToast({
            title: res.data?.msg || '获取数据失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('获取已完成工单失败', err);
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      }
    });
  },

  // 点击左上角返回箭头
  onBack: function() {
    // 判断是否可以返回上一页
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({
        delta: 1
      });
    } else {
      // 如果没有上一页，则跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  // 房号输入
  onHouseNumberInput(e) {
    this.setData({ houseNumber: e.detail.value });
  },

  // 紧急程度点击
  onEmergencyTap(e) {
    const level = e.currentTarget.dataset.level;
    this.setData({ emergencyLevel: level });
  },

  // 维修区域选择
  onAreaTap(e) {
    const area = e.currentTarget.dataset.area;
    this.setData({ repairArea: area });
  },

  // 问题描述输入
  onDescriptionInput(e) {
    this.setData({ 
      description: e.detail.value,
      descriptionLength: e.detail.value.length // 新增
    });
  },

  // 上传按钮点击
  onUploadTap() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths;
        if (that.data.uploadedImages.length + tempFilePaths.length > 3) {
          wx.showToast({
            title: '最多上传3张图片',
            icon: 'none'
          });
          return;
        }
        wx.showLoading({
          title: '读取中...',
        });
        // 读取图片为base64
        wx.getFileSystemManager().readFile({
          filePath: tempFilePaths[0],
          encoding: 'base64',
          success: (fileRes) => {
            wx.hideLoading();
            // 直接存base64字符串
            that.setData({
              uploadedImages: [...that.data.uploadedImages, tempFilePaths[0]],
              problemImageKeys: [...that.data.problemImageKeys, fileRes.data]
            });
          },
          fail: (err) => {
            wx.hideLoading();
            wx.showToast({
              title: '图片读取失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },
  
  // 上传图片到服务器
  uploadImage(filePath) {
    const that = this;
    wx.uploadFile({
      url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/repairOrder/uploadImage',
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': 'Bearer ' + (wx.getStorageSync('token') || ''),
        'communityId': wx.getStorageSync('communityId') || ''
      },
      success(res) {
        wx.hideLoading();
        
        try {
          // 解析返回的数据
          const data = JSON.parse(res.data);
          if (data.code === '200') {
            // 获取图片key
            const imageKey = data.data.key || data.data;
            
            // 更新图片数组和key数组
            that.setData({
              uploadedImages: [...that.data.uploadedImages, filePath],
              problemImageKeys: [...that.data.problemImageKeys, imageKey]
            });
          } else {
            wx.showToast({
              title: data.msg || '图片上传失败',
              icon: 'none'
            });
          }
        } catch (error) {
          console.error('解析上传响应失败', error);
          wx.showToast({
            title: '图片上传失败',
            icon: 'none'
          });
        }
      },
      fail(err) {
        wx.hideLoading();
        console.error('上传图片失败', err);
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        });
      }
    });
  },
  
  // 删除已上传图片
  onDeleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.uploadedImages];
    const keys = [...this.data.problemImageKeys];
    
    // 同时删除图片和对应的key
    images.splice(index, 1);
    keys.splice(index, 1);
    
    this.setData({
      uploadedImages: images,
      problemImageKeys: keys
    });
  },

  // 联系人输入
  onContactNameInput(e) {
    this.setData({ contactName: e.detail.value });
  },

  // 联系方式输入
  onContactPhoneInput(e) {
    // 仅保留数字
    const val = e.detail.value.replace(/\D/g, '');
    this.setData({ contactPhone: val });
  },

  // 期望上门时间
  onDateChange(e) {
    // 这里可将选择的日期格式化后显示
    this.setData({ expectedDate: e.detail.value });
  },

  // 时间段选择
  onTimeSlotTap(e) {
    const slot = e.currentTarget.dataset.slot;
    this.setData({ selectedTimeSlot: slot });
  },
  
  // 重置
  onReset() {
    this.setData({
      houseNumber: '',
      emergencyLevel: '',
      repairArea: '公共区域',
      description: '',
      contactName: '',
      contactPhone: '',
      expectedDate: 'YYYY - MM - DD',
      selectedTimeSlot: '',
      uploadedImages: [],
      problemImageKeys: []
    });
  },
  
  // 提交
  onSubmit() {
    const {
      houseNumber,
      emergencyLevel,
      repairArea,
      description,
      contactName,
      contactPhone,
      expectedDate,
      selectedTimeSlot,
      problemImageKeys
    } = this.data;
    
    // 表单验证
    if (!houseNumber) {
      wx.showToast({
        title: '请输入房号',
        icon: 'none'
      });
      return;
    }
    
    if (!emergencyLevel) {
      wx.showToast({
        title: '请选择紧急程度',
        icon: 'none'
      });
      return;
    }
    
    if (!description) {
      wx.showToast({
        title: '请输入问题描述',
        icon: 'none'
      });
      return;
    }
    
    // 验证问题描述字数
    if (description.length < 2 || description.length > 50) {
      wx.showToast({
        title: '问题描述需在2-50个字之间',
        icon: 'none'
      });
      return;
    }
    
    if (!contactName) {
      wx.showToast({
        title: '请输入联系人',
        icon: 'none'
      });
      return;
    }
    
    // 验证手机号格式
    if (contactPhone.length !== 11) {
      wx.showToast({
        title: '联系方式需为11位数字',
        icon: 'none'
      });
      return;
    }
    
    if (expectedDate === 'YYYY - MM - DD') {
      wx.showToast({
        title: '请选择期望上门时间',
        icon: 'none'
      });
      return;
    }
    
    if (!selectedTimeSlot) {
      wx.showToast({
        title: '请选择时间段',
        icon: 'none'
      });
      return;
    }
    
    // 将日期转换为时间戳
    const dateObj = new Date(expectedDate);
    const timestamp = dateObj.getTime();
    
    // 构建请求数据
    const requestData = {
      urgency: emergencyLevel,
      roomNumber: parseInt(houseNumber),
      repairArea: repairArea,
      problemDescription: description,
      contactName: contactName,
      contactPhone: contactPhone,
      expectedVisitTime: timestamp,
      problemImageKeys: problemImageKeys
    };
    
    // 显示加载提示
    wx.showLoading({
      title: '提交中...',
    });
    
    // 发送请求
    wx.request({
      url: 'https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/repairOrder/uploadOrder',
      method: 'POST',
      data: requestData,
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync('token') || '',
        'communityId': this.getCommunityId()
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.statusCode === 200 && res.data && res.data.code === '200') {
          wx.showToast({
            title: '提交成功',
            icon: 'success'
          });
          
          // 重置表单
          this.onReset();
          
          // 刷新待受理列表
          this.loadPendingOrders();
          
          // 切换到待受理Tab
          this.setData({ activeTab: 1 });
        } else {
          wx.showToast({
            title: res.data?.msg || '提交失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('提交工单失败', err);
        wx.showToast({
          title: '提交失败，请稍后重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 点击"联系维修人员"按钮
  onContact: function(e) {
    const index = e.currentTarget.dataset.index;
    const type = e.currentTarget.dataset.type;
    let repairItem;
    
    // 根据当前激活的Tab确定使用哪个列表
    if (type === 'pending') {
      repairItem = this.data.pendingOrders[index];
    } else if (type === 'processing') {
      repairItem = this.data.processingOrders[index];
    } else {
      repairItem = this.data.completedOrders[index];
    }
    
    // 模拟维修人员电话号码
    const phoneNumber = repairItem.repairManPhone || '13800138000';
    const repairManName = repairItem.repairManName || '张师傅';
    
    // 弹窗显示维修人员电话
    wx.showModal({
      title: '维修人员联系方式',
      content: `${repairManName}: ${phoneNumber}`,
      confirmText: '拨打',
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          // 用户点击了拨打按钮
          wx.makePhoneCall({
            phoneNumber: phoneNumber,
            fail(err) {
              console.error('拨打电话失败', err);
              wx.showToast({
                title: '拨打失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 点击"催单"按钮
  onUrge: function(e) {
    const index = e.currentTarget.dataset.index;
    const orderId = this.data.pendingOrders[index].id;
    
    // 发送催单请求
    wx.request({
      url: `https://property-func-dcwdljroao.cn-shenzhen.fcapp.run/repairOrder/urge/${orderId}`,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': (wx.getStorageSync('token') || ''),
        'communityId': this.getCommunityId()
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.code === '200') {
          // 弹窗显示"已催单"
          wx.showToast({
            title: '已催单',
            icon: 'success',
            duration: 2000
          });
        } else {
          wx.showToast({
            title: res.data?.msg || '催单失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('催单失败', err);
        wx.showToast({
          title: '催单失败，请稍后重试',
          icon: 'none'
        });
      }
    });
  }
});