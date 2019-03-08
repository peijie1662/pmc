<template>
  <div>
    <div class="workarea">
      <!-- 表格显示 -->
      <div v-if="!disSwitch">
        <!-- 标题栏 -->
        <div style="height:25px;background:#20a0ff;position:relative;">
          <span style="color:white;margin-left:10px;">{{bgBay}} - {{edBay}}</span>
          <span style="color:white;margin-left:10px;">{{msg}}</span>
          <div style="float:right;margin-right:10px;">
            <i
              class="iconfont icon-delete icon"
              @click="delWatchRange"
              id="delBtn"
            ></i>
          </div>
        </div>
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
                <td>{{c2.xce}}</td>
                <td>{{c2.jz}}</td>
                <td>{{c2.sz}}</td>
                <td>{{c2.zce}}</td>
              </tr>
              <tr>
                <td>{{c4.size}}</td>
                <td>{{c4.jx}}</td>
                <td>{{c4.sx}}</td>
                <td>{{c4.xce}}</td>
                <td>{{c4.jz}}</td>
                <td>{{c4.sz}}</td>
                <td>{{c4.zce}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- 图形显示 -->
      <div v-if="disSwitch">
        <ve-histogram :data="chartData" height="200px"></ve-histogram>
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
      chartData: {
        columns: ["日期", "访问用户", "下单用户", "下单率"],
        rows: [
          { 日期: "1/1", 访问用户: 1393, 下单用户: 1093, 下单率: 0.32 },
          { 日期: "1/2", 访问用户: 3530, 下单用户: 3230, 下单率: 0.26 },
          { 日期: "1/3", 访问用户: 2923, 下单用户: 2623, 下单率: 0.76 },
          { 日期: "1/4", 访问用户: 1723, 下单用户: 1423, 下单率: 0.49 },
          { 日期: "1/5", 访问用户: 3792, 下单用户: 3492, 下单率: 0.323 },
          { 日期: "1/6", 访问用户: 4593, 下单用户: 4293, 下单率: 0.78 }
        ]
      }
    };
  },
  methods: {
    delWatchRange() {
      this.$emit("delWatchRange"); 
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


