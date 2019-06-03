<template>
  <div class="main">
    <!-- 设备信息 -->
    <div class="deviceInfo">
      <div class="device-box">
        <h1>25℃</h1>
        <p>当前温度</p>
      </div>
      <div class="device-bg">
        <img :src="productInfo.img">
      </div>
    </div>

    <!--<img src="https://img.alicdn.com/tfs/TB1B3GmJkvoK1RjSZPfXXXPKFXa-104-104.png">-->


    <!-- 设备状态 button -->
    <div class="tn-pushGroup">
      <div v-for="(item, key) in deviceStatusButton" :key="key" class="tn-pushButton ux-box">
        <div class="ux-box__title">{{ item.text }}</div>
        <div class="ux-box__desc" @click="handleButtonClick(item.type, key)">
          <sapn v-if="item.type === 'switch'" :class="`icon-circle ${item.value === 1 ? 'active' : ''}`"></sapn>
          <template v-else>
            <span>{{ item.desc }}</span>
            <svg aria-hidden="true" class="tn-icon"><use xlink:href="#icon-arrow"></use></svg>
          </template>
        </div>
      </div>
    </div>
    <!-- 设备状态 bar -->
    <div class="tn-pushBar">
      <div v-for="(item, key) in deviceStatusBar" :key="key" class="tn-pushBar-item ux-box">
          <div class="tn-pushBar__mid">
            <span class="ux-box__title">{{ item.text }}</span>
          </div>
          <div class="ux-box__desc" @click="handleButtonClick(item.type, key)">
            <span>{{ item.desc }}</span>
            <svg aria-hidden="true" class="tn-icon"><use xlink:href="#icon-arrow"></use></svg>
          </div>
      </div>
    </div>

    <!-- 弹框 -->
    <div class="actionDialog">
      <!-- 弹框 - 加热档位heaterPower -->
      <action-dialog :show.sync="heaterShow"
                     :height="260"
                     @confirm="onConfirm"
                     title="加热档位"
      >
        <select-list v-if="heaterShow" :height="240" :info="selectHeaterPower" v-on:selectBack="handleSelectBack"></select-list>
      </action-dialog>
      <!-- 弹框 - 目标温度targetTemperature -->
      <action-dialog :show.sync="tempShow"
                     :height="260"
                     @confirm="onConfirm"
                     title="目标温度"
      >
        <select-list v-if="tempShow" :height="240" :info="selectTargetTemperature" v-on:selectBack="handleSelectBack"></select-list>
      </action-dialog>
      <!-- 弹框 - 模式mode -->
      <action-dialog :show.sync="modeShow"
                     :height="260"
                     @confirm="onConfirm"
                     title="工作模式"
      >
        <select-list v-if="modeShow" :height="240" :info="selectMode" v-on:selectBack="handleSelectBack"></select-list>
      </action-dialog>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import Vue from 'vue'
import { mapState } from 'vuex';
import { Loading, Toast, PushBar, PushGroup,PushButton, ActionDialog, SelectList } from 'genie-ui';
Vue.use(Loading)
Vue.use(Toast)

export default {
  name: 'Main',
  components: {
    PushBar,
    PushGroup,
    PushButton,
    ActionDialog,
    SelectList
  },
  data() {
    return {
      heaterShow: false,
      tempShow: false,
      modeShow: false
    };
  },
  computed: {
    ...mapState({
      // 在线状态
      onlinestate: state => {
        const onlinestate = state.publicInfo.attr.onlinestate;
        return onlinestate === 1;
      },
      // 开关状态
      powerstate: state => {
        const powerstate = state.publicInfo.attr.powerstate;
        return powerstate === 1;
      },
      // 设备状态 button
      deviceStatusButton(state) {
        const attr = state.publicInfo.attr;
        return {
          OSD: {
            text: attr.OSD === 1 ? '屏幕开' : '屏幕关',
            type: 'switch',
            value: attr.OSD
          },
          heaterPower: {
            text: '加热档位',
            type: 'arrow',
            value: attr.heaterPower,
            desc: state.publicInfo.heaterPower[attr.heaterPower]
          },
          childLockOnOff: {
            text: attr.childLockOnOff === 1 ? '童锁开' : '童锁关',
            type: 'switch',
            value: attr.childLockOnOff
          }
        }
      },
      // 设备状态 bar
      deviceStatusBar(state) {
        const attr = state.publicInfo.attr;
        const data = { textColor: '#646464', descColor: '#323232' }
        return {
          targetTemperature: {
            text: '目标温度',
            type: 'arrow',
            desc: `${attr.targetTemperature > 0 ? attr.targetTemperature : 15}℃`,
            ...data
          },
          mode: {
            text: '工作模式',
            type: 'arrow',
            desc: attr.mode ? state.publicInfo.mode[attr.mode] : '普通模式',
            ...data
          }
        }
      },

      // 列表选择数据 - 加热档位
      selectHeaterPower(state) {
        const obj = state.publicInfo.heaterPower;
        let values = [];
        for(let key in obj) {
          values.push({ text: obj[key], value: key })
        }
        return [{ activeVal: obj[state.publicInfo.attr.heaterPower] || '', values: values }]
      },
      // 列表选择数据 - 目标温度
      selectTargetTemperature(state) {
        const activeVal = state.publicInfo.attr.targetTemperature;
        let values = [];
        for(let key = 15; key <= 35; key++) {
          values.push({ text: `${key}℃`, value: key })
        }
        return [{ activeVal: activeVal, values: values }]
      },
      // 列表选择数据 - 工作模式
      selectMode(state) {
        const obj = state.publicInfo.mode;
        let values = [];
        for(let key in obj) {
          values.push({ text: obj[key], value: key })
        }
        return [{ activeVal: obj[state.publicInfo.attr.mode] || '', values: values }]
      },





      // 产品信息详情
      productInfo: state => {
        return state.base.productInfo;
      },
    }),
  },
  created() {
    // 设置topbar
    this.$nextTick(() => {
      AI.setNavbar({
        title: '取暖器',
      })
    });
  },
  beforeDestroy() {
    AI.allListenRemove(); // 取消页面所有监听
  },
  methods: {
    // 点击按钮
    handleButtonClick (type, key) {
      if (key === 'powerstate') {
        this.handleSetDeviceStatus({
          powerstate: this.powerstate ? 0 : 1
        })
      } else if (key === 'OSD') {
        this.handleSetDeviceStatus({
          OSD: this.OSD ? 0 : 1
        })
      } else if (key === 'childLockOnOff') {
        this.handleSetDeviceStatus({
          childLockOnOff: this.childLockOnOff ? 0 : 1
        })
      } else if (key === 'targetTemperature') {
        this.tempShow = !this.tempShow
      } else if (key === 'mode') {
        this.modeShow = !this.modeShow
      } else if (key === 'heaterPower') {
        this.heaterShow = !this.heaterShow
      }
    },

    // 设置设备属性状态
    handleSetDeviceStatus (attrs) {
      this.$loading.open()
      const _this = this
      this.$store.dispatch('setDeviceStatus', {
        attrs: attrs,
        callback: function (res) {
          _this.$loading.close()
          if (res.code !== 'SUCCEED') {
            _this.$toast({ type: 'error', text: res.msg })
          }
        }
      })
    },

    handleSelectBack (val) {
      console.log(4444, val)
    },

    onConfirm (val) {
      console.log(999999, 'confirm', val)
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.deviceInfo-1 {
  display: flex;
  height: 180px;
  margin-bottom: 10px;
  background-color: #fff;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  img {
    height: 80px;
  }
  .title {
    color: #4a4a4a;
    font-weight: bold;
    padding-top: 5px;
  }
}
</style>
