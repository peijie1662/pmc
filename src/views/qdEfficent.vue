<template>
  <div>
    <!-- 通用设置 -->
    <div class="header">
      <div v-for="(qd,index) in qdEfficents" :key="index" class="qd">
        <div>
          <b>{{qd.qdno}}</b>
        </div>
        <div style="overflow:hidden;">
          <span style="margin-left:5px;margin-top:5px;float:left;">默认效率：</span>
          <el-input-number
            v-model="qd.default"
            size="mini"
            :min="0"
            style="width:100px;float:right;"
          ></el-input-number>
        </div>
        <div
          v-for="(vessel,index) in qd.vessels"
          :key="index"
          style="margin-top:5px;overflow:hidden;"
        >
          <span style="margin-left:5px;margin-top:5px;float:left;">{{vessel.vessel}}</span>
          <el-input-number
            v-model="vessel.efficent"
            size="mini"
            :min="0"
            style="width:100px;float:right;"
          ></el-input-number>
        </div>
      </div>
    </div>
    <div style="overflow:hidden;">
      <el-button
        size="small"
        @click="efficentOk"
        style="float:right;margin-right:10px;margin-top:10px;"
      >确定</el-button>
      <el-button
        size="small"
        @click="efficentCancel"
        style="float:right;margin-right:10px;margin-top:10px;"
      >取消</el-button>
    </div>
  </div>
</template>

<script>
//1.先设每个桥吊的通用效率
//2.再设桥吊下各船的效率
export default {
  data() {
    return {
      //{default:0,vessels:[]}
      qdEfficents: []
    };
  },
  props: {
    qds: {
      type: Array,
      default: []
    },
    aqs: {
      type: Array,
      default: []
    }
  },
  watch: {
    qds: {
      //1.初始化对象数组
      handler(newQds, oldValue) {
        let me = this;
        me.qdEfficents = me.qds.map(qd => {
          return { qdno: qd.qdno, default: 0, vessels: [] };
        });
      },
      immediate: true
    },
    aqs: {
      handler(newAqs, oldValue) {
        let me = this;
        //2.初始化对象数组中的船舶数组
        newAqs.forEach(qd => {
          let qe = me.qdEfficents.find(item => item.qdno == qd.qdno);
          qe.vessels = [];
          qd.vessels.forEach(v => {
            qe.vessels.push({ vessel: v, efficent: 0 });
          });
        });
        //3.从保存的内容中查找是否设置过效率
        let saveQes = JSON.parse(localStorage.getItem("efficents"));
        if (saveQes) {
          me.qdEfficents.forEach(qe => {
            let sqe = saveQes.find(item => item.qdno == qe.qdno);
            //3.1 默认效率
            if (sqe.default > 0) {
              qe.default = sqe.default;
            }
            //3.2 船效率
            qe.vessels.forEach(qv => {
              let sqv = sqe.vessels.find(item => item.vessel == qv.vessel);
              if (sqv && sqv.efficent > 0) {
                qv.efficent = sqv.efficent;
              }
            });
          });
        }
      },
      immediate: true
    }
  },
  methods: {
    efficentOk() {
      localStorage.setItem("efficents", JSON.stringify(this.qdEfficents));
      this.$emit("efficentChange", this.qdEfficents);
    },
    efficentCancel() {
      this.$emit("efficentChange", null);
    }
  }
};
</script>

<style scoped>
.header {
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #c0c4cc;
  padding: 10px;
}
.qd {
  width: 202px;
  height: 160px;
  border: 1px solid #c0c4cc;
  float: left;
  margin-left: 10px;
  margin-top: 10px;
  overflow: scroll;
}
</style>