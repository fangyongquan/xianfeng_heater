import Vue from 'vue'
import Vuex from 'vuex'

import publicInfo from './modules/public' // 公共vuex
import setting from './modules/setting' // 设备固定配置

Vue.use(Vuex)

/* eslint-disable no-new */
export default new Vuex.Store({
  modules: {
    publicInfo,
    setting
  }
})
