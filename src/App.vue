<template>
  <div id="appview">
    <iot-header :data='navBarData' color="#323232"></iot-header>
    <router-view/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { IotHeader } from 'genie-ui';

export default {
  name: 'App',
  components: {
    IotHeader
  },
  created: function () {
    this.$store.dispatch('deviceStatusPolling')
  },
  computed: {
    ...mapState({
      navBarData (state) {
        return {
          ...state.base.navBarData,
          right: [
            {
              content: 'https://img.alicdn.com/tfs/TB1yOtHB9zqK1RjSZFLXXcn2XXa-40-40.png',
              eventFunc: () => {
                AI.goWeexSetPage({
                  title: '设置'
                });
              },
              type: 'image',
            }
          ]
        }
      }
    })
  },
}
</script>

<style lang="less" >
@import './assets/less/style.less';
@import 'genie-ui/build/tunas.css';
html,
body {
  margin: 0;
  height: 100%;
}
</style>
