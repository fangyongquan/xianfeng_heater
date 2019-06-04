<template>
  <div class="main" :class="deviceInfo.onlinestate ? (deviceInfo.powerstate ? `switch-on` : `switch-off`) : 'disabled'">
    <!-- 设备信息 -->
    <div class="deviceInfo">
      <div v-if="!deviceInfo.onlinestate" >设备处于离线状态</div>
      <div v-else-if="!deviceInfo.powerstate">
        <p>设备处于关闭状态</p>
        <p style="margin-top: 10px">点击开关开启</p>
      </div>
      <div v-else class="device-box">
        <h1>{{ deviceInfo.temperature }}℃</h1>
        <p>当前温度</p>
      </div>
      <div class="device-bg">
        <img :src="deviceInfo.image">
      </div>
    </div>
    <!-- 设备状态 switch -->
    <div class="tn-pushGroup">
      <div v-for="(item, key) in deviceStatusSwitch"
           :key="key"
           class="tn-pushButton ux-box"
           :class="`${key === 'powerstate' ? 'switch' : ''}`"
      >
        <div class="ux-box__title">{{ item.text }}{{ item.switch ? '开' : '关' }}</div>
        <div class="ux-box__desc" @click="handleButtonClick(key)">
          <span :class="`icon-circle ${item.switch ? 'active' : ''}`"></span>
        </div>
      </div>
    </div>
    <!-- 设备状态 button -->
    <div class="tn-pushGroup">
      <div v-for="(item, key) in deviceStatusButton" :key="key" class="tn-pushButton ux-box">
        <div class="ux-box__title">{{ item.text }}</div>
        <div class="ux-box__desc" @click="handleButtonClick(key, item.type)">
          <span>{{ item.desc }}</span>
          <svg aria-hidden="true" class="tn-icon"><use xlink:href="#icon-arrow"></use></svg>
        </div>
      </div>
    </div>
    <!-- 设备状态 bar -->
    <div class="tn-pushBar" v-for="(item, key) in deviceStatusBar" :key="key">
      <div class="tn-pushBar-item ux-box">
        <div class="tn-pushBar__mid">
          <span class="ux-box__title">{{ item.text }}</span>
        </div>
        <div class="ux-box__desc" @click="handleButtonClick(key, item.type)">
          <span>{{ item.desc }}</span>
          <svg aria-hidden="true" class="tn-icon"><use xlink:href="#icon-arrow"></use></svg>
        </div>
      </div>
    </div>

    <!-- 弹框 - 工作模式 mode | 加热档位 heaterPower | 目标温度 targetTemperature -->
    <action-dialog :show.sync="show"
                   :height="260"
                   :title="selectOption.title || '选择'"
                   @confirm="handleOnConfirmAttr"
    >
      <select-list v-if="show" :height="240" :info="selectOption.data" v-on:selectBack="handleSelectBack"></select-list>
    </action-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
import Vue from 'vue'
import { mapState } from 'vuex';
import { Loading, Toast, PushBar, PushGroup, PushButton, ActionDialog, SelectList } from 'genie-ui';
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
      active: null,
      show: false,
      select: []
    };
  },
  computed: {
    ...mapState({
      // 设备信息
      deviceInfo(state) {
        const attr = state.publicInfo.attr;
        const on = 'https://img.alicdn.com/imgextra/i4/2759460135/O1CN01MOtsXa1Crs0FdYQLr_!!2759460135.png';
        const off = 'https://img.alicdn.com/imgextra/i3/2759460135/O1CN01a2UTe61Crs0GoDtby_!!2759460135.png';
        return {
          ...attr,
          image: attr.powerstate ? on : off
        }
      },
      // 设备状态 switch
      deviceStatusSwitch(state) {
        const attr = state.publicInfo.attr;
        return {
          powerstate: { text: '设备', switch: attr.powerstate },
          OSD: { text: '屏幕', switch: attr.OSD },
          childLockOnOff: { text: '童锁', switch: attr.childLockOnOff }
        }
      },
      // 设备状态 Button
      deviceStatusButton(state) {
        const attr = state.publicInfo.attr;
        return {
          mode: {
            text: '工作模式',
            type: 'arrow',
            desc: state.setting.modeObj[attr.mode]
          },
          heaterPower: {
            text: '加热档位',
            type: 'arrow',
            desc: state.setting.heaterPowerObj[attr.heaterPower]
          }
        }
      },
      // 设备状态 bar
      deviceStatusBar(state) {
        const attr = state.publicInfo.attr;
        return {
          targetTemperature: {
            text: '目标温度',
            type: 'arrow',
            desc: attr.targetTemperature > 0 ? `${attr.targetTemperature}℃` : null
          }
        }
      },
      // 列表选择数据 - 加热档位
      selectOption(state) {
        const key = this.active;
        const attr = state.publicInfo.attr;
        if (key === 'mode') {
          return {
            title: '工作模式',
            data: [{ activeVal: state.setting.modeObj[attr.mode] || '', values: state.setting.modeValues }]
          }
        } else if (key === 'heaterPower') {
          return {
            title: '加热档位',
            data: [{ activeVal: state.setting.heaterPowerObj[attr.heaterPower] || '', values: state.setting.heaterPowerValues }]
          }
        } else if (key === 'targetTemperature') {
          let values = [];
          for (let key = 15; key <= 35; key++) {
            values.push({ text: key })
          }
          return {
            title: '目标温度',
            data: [{ activeVal: attr.targetTemperature, values: values, unit: '℃' }]
          }
        }
        return { title: '', data: [] }
      },
    })
  },
  created() {
    this.$nextTick(() => {
      // 设置topbar,
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
    handleButtonClick(key, type = null) {
      const attr = this.deviceInfo;
      this.active = key
      this.show = false
      this.select = []

      if (attr.onlinestate && (attr.powerstate || key === 'powerstate')) {
        if (type === 'arrow') {
          this.show = true
        } else {
          this.handleOnConfirmAttr()
        }
      }
      return false
    },
    // 选择select
    handleSelectBack(val) {
      this.select = val
    },

    // 获取修改设备属性
    handleOnConfirmAttr() {
      const attr = this.deviceInfo;
      const key = this.active;
      const select = this.select[0];
      let option = {}

      if (key === 'mode' || key === 'heaterPower') {
        const array = key === 'mode' ? this.$store.state.setting.modeValues : this.$store.state.setting.heaterPowerValues
        for (let item of array) {
          if (item.text === select) {
            option[key] = Number(item.value)
            break;
          }
        }
      } else if (key === 'targetTemperature') {
        option.targetTemperature = Number(select)
      } else if (key === 'powerstate' || key === 'OSD' || key === 'childLockOnOff') {
        option[key] = attr[key] ? 0 : 1
      }
      this.handleSetDeviceStatus(option)
    },

    // 设置设备属性状态
    handleSetDeviceStatus(attrs) {
      this.$loading.open()
      const _this = this
      this.$store.dispatch('setDeviceStatus', {
        attrs: attrs,
        callback: function (res) {
          _this.$loading.close()
          if (res.code !== 'SUCCEED') {
            _this.$toast({type: 'error', text: res.msg})
          }
        }
      })
    }
  }
};
</script>
