<template>
  <div>
    <div class="workarea">
      <!-- 标题栏 -->
      <div style="height:25px;background:#20a0ff;position:relative;">
        <span style="color:white;margin-left:10px;">{{bgBay}} - {{edBay}}</span>
        <span style="color:white;margin-left:10px;">{{msg}}</span>
        <div style="float:right;margin-right:10px;">
          <i class="iconfont icon-delete icon" @click="delWatchRange" id="delBtn"></i>
        </div>
      </div>
      <!-- 表格显示 -->
      <div v-if="!disSwitch">
        <!-- 表内容 -->
        <div style="margin-top:5px;height:160px;overflow:auto;">
          <table>
            <thead>
              <tr>
                <th>贝</th>
                <th>计卸</th>
                <th>实卸</th>
                <th>差额</th>
                <th>计装</th>
                <th>实装</th>
                <th>差额</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(wa,index) in watchAreas" :key="index">
                <td>{{wa.bay}}</td>
                <td>{{wa.jx}}</td>
                <td>{{wa.sx}}</td>
                <td>{{wa.xce}}</td>
                <td>{{wa.jz}}</td>
                <td>{{wa.sz}}</td>
                <td>{{wa.zce}}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 统计栏 -->
        <div style="margin-top:10px;">
          <table>
            <thead>
              <tr>
                <th>尺寸</th>
                <th>计卸</th>
                <th>实卸</th>
                <th>差额</th>
                <th>计装</th>
                <th>实装</th>
                <th>差额</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{c2.size}}</td>
                <td>{{c2.jx}}</td>
                <td>{{c2.sx}}</td>
                <td :style="showCe(c2.xce)">{{c2.xce}}</td>
                <td>{{c2.jz}}</td>
                <td>{{c2.sz}}</td>
                <td :style="showCe(c2.zce)">{{c2.zce}}</td>
              </tr>
              <tr>
                <td>{{c4.size}}</td>
                <td>{{c4.jx}}</td>
                <td>{{c4.sx}}</td>
                <td :style="showCe(c4.xce)">{{c4.xce}}</td>
                <td>{{c4.jz}}</td>
                <td>{{c4.sz}}</td>
                <td :style="showCe(c4.zce)">{{c4.zce}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- 图形显示 -->
      <div v-if="disSwitch">
        <ve-histogram :data="chartData" :settings="chartSettings" height="250px"></ve-histogram>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      msg: "",
      bgBay: "",
      edBay: "",
      c2: "",
      c4: "",
      watchAreas: [],
      chartSettings: {
        stack: { 装: ["实际装船", "装船差额"], 卸: ["实际卸船", "卸船差额"] }
      },
      chartData: {
        columns: ["贝", "实际装船", "装船差额", "实际卸船", "卸船差额"],
        rows: [] //{"贝":0,"计划装船":0, "实际装船":0, "计划卸船":0,"实际卸船";0}
      }
    };
  },
  methods: {
    delWatchRange() {
      this.$emit("delWatchRange");
    },
    //显示差额
    showCe(val) {
      if (val == 0) {
        return { color: "#20a0ff" };
      } else {
        return { color: "red" };
      }
    }
  },
  props: ["watchRange", "disSwitch"],
  watch: {
    watchRange(val) {
      this.msg = val.msg;
      this.bgBay = val.bgBay;
      this.edBay = val.edBay;
      this.c2 = {
        size: "20",
        jx: val.jx2,
        sx: val.sx2,
        xce: val.xce2,
        jz: val.jz2,
        sz: val.sz2,
        zce: val.zce2
      };
      this.c4 = {
        size: "40",
        jx: val.jx4,
        sx: val.sx4,
        xce: val.xce4,
        jz: val.jz4,
        sz: val.sz4,
        zce: val.zce4
      };
      this.watchAreas = val.watchAreas;
      //图表数据
      this.chartData.rows = this.watchAreas.map(function(wa) {
        return {
          贝: wa.bay,
          实际装船: wa.sz,
          装船差额: wa.zce,
          实际卸船: wa.sx,
          卸船差额: wa.xce
        };
      });
    }
  }
};
</script>
<style scoped>
#delBtn:hover {
  color: red;
}
table {
  border-collapse: collapse;
}
th,
td {
  width: 30px;
  height: 15px;
  padding: 0;
  border: 1px solid #20a0ff;
  font: 10px "微软雅黑";
  text-align: center;
}
.workarea {
  width: 220px;
  height: 250px;
  border: 1px #20a0ff solid;
  background: white;
  padding: 5px;
}
</style>


