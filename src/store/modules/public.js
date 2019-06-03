/* eslint-disable no-new */
export default {
  state: {
    status: 0, // 设备状态 0 - 未激活， 1 - 在线， 3 - 离线， 8 - 禁用,
    attr: {}, // 设备属性
    errorInfo: {}, // 设备上报的错误信息
    scheduleInfo: {}, // 即将到来的定时，倒计时信息
    mode: {
      39: '普通模式',
      230: '节能模式'
    },
    heaterPower: {
      1: '低热档',
      2: '中热档',
      3: '高热档'
    }
  },
  mutations: { // 更改 Vuex 的 store 中的状态的唯一方法是提交 mutation, 只能同步
    /**
     * 更新状态树中的设备相关状态
     * @param {object} payload.data 新的数据
     */
    updateDeviceStatus(state, payload) {
      const { data } = payload
      const { status, attr = {}, errorInfo = {}, scheduleInfo = {} } = data
      if (status !== undefined) state.status = status
      state.attr = Object.assign({}, state.attr, attr)
      state.errorInfo = errorInfo
      state.scheduleInfo = scheduleInfo
    },
    /**
     * 更新状态树中的属性集合
     * @param {*} attr 要更新的属性集合
     */
    updateDeviceAttr(state, attr = {}) {
      state.attr = Object.assign({}, state.attr, attr)
    }
  },
  actions: {
    /**
     * 获取设备状态
     */
    deviceStatusPolling({ commit }) {
      AI.deviceStatusPolling((resp) => {
        console.log('获取设备状态：', resp.model);
        // 停止页面轮询
        AI.polling.stop();
        // 更新设备状态
        commit('updateDeviceStatus', { data: resp.model })
      }, (error) => {
        console.log('[deviceStatusPolling error]', error)
      })
    },
    /**
     * 设置设备属性状态
     * @param {object} attrs 需要设置的属性集合
     * @param {function} callback 返回操作
     */
    setDeviceStatus({ state, commit }, { attrs, callback }) {
      if (state.attr.onlinestate !== 'online') {
        const err = { code: 'SET_FAIL', msg: '**设备不在线 无法操控**' }
        callback(err);
        return;
      }
      // 设置数据
      AI.setDeviceStatus(attrs).then((resp) => {
        if (resp.code === 'SUCCEED') {
          // 更新数据
          commit('updateDeviceStatus', { data: { attr: attrs } });
        }
        callback(resp)
      }).catch((err) => {
        callback(err)
      })
    }
  }
}
