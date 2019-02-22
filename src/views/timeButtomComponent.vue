<template>
  <div style="display:inline-block;">
    <div class="time_btn" ref="btn" @click="click" :style="btnStyle">
      <div>{{caption}}</div>
      <transition name="tb" v-on:enter="enter" v-on:afterEnter="afterEnter">
        <div v-show="show" class="progress_line"></div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.progress_line {
  width: 95%;
  height: 3px;
  background: #ff5500;
  position: absolute;
  left: 2px;
  bottom: 3px;
}
.tb-enter {
  width: 0px;
}
.tb-enter-active {
  transition: width 10s;
}
</style>

<script>
export default {
  data() {
    return {
      //进度条显示
      show: false,
      //按钮样式
      btnStyle: "",
      //按钮有效状态
      valid_style: {
        width: this.width,
        height: this.height,
        lineHeight: this.height,
        textAlign: "center",
        background: "#ecf5ff",
        color: "#409eff",
        border: "1px solid #b3d8ff",
        cursor: "Pointer",
        borderRadius: "3px",
        position: "relative",
      },
      //按钮无效状态
      invalid_style: {
        width: this.width,
        height: this.height,
        lineHeight: this.height,
        textAlign: "center",
        background: "#fff",
        color: "#c0c4cc",
        border: "1px solid #ebeef5",
        cursor: "not-allowed",
        borderRadius: "3px",
        position: "relative",
      }
    };
  },
  props: {
    //按钮文字
    caption: {
      type: String,
      default: "Time Button"
    },
    //高度
    height: {
      type: String,
      default: "50px"
    },
    //宽度
    width: {
      type: String,
      default: "150px"
    },
    //延时
    delay: {
      type: Number,
      default: 3000
    },
    //执行
    fun: {
      type: Function,
      default: function() {
        console.log("time button click!");
      }
    }
  },
  methods: {
    click() {
      this.show = !this.show;
      if (this.btnStyle == this.valid_style) {
        this.fun();
      }
    },
    enter() {
      this.show = true;
      this.btnStyle = this.invalid_style;
    },
    afterEnter() {
      this.show = false;
      this.btnStyle = this.valid_style;
    }
  },
  mounted() {
    this.btnStyle = this.valid_style;
  }
};
</script>

