Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '提示'
    },
    content: {
      type: String,
      value: ''
    },
    confirmText: {
      type: String,
      value: '确定'
    }
  },
  methods: {
    onConfirm() {
      this.triggerEvent('confirm');
      this.setData({
        show: false
      });
    }
  }
}); 