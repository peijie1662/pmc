<template>
  <div>
    <el-dialog title="单箱信息" :visible.sync="dialogVisible" width="350px">
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">箱号:</span>
        <span class="dialogContent" style="position:absolute;left:80px;">{{dcntr.cntrid}}</span>
      </div>
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">箱型:</span>
        <span class="dialogContent" style="position:absolute;left:80px;">{{dcntr.ctty}}</span>
        <span class="dialogtitle" style="position:absolute;left:140px;">尺寸:</span>
        <span class="dialogContent" style="position:absolute;left:200px;">{{dcntr.ctsz}}</span>
      </div>
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">装货港:</span>
        <span class="dialogContent" style="position:absolute;left:80px;">{{dcntr.port}}</span>
        <span class="dialogtitle" style="position:absolute;left:140px;">箱主:</span>
        <span class="dialogContent" style="position:absolute;left:200px;">{{dcntr.lncd}}</span>
      </div>
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">空重:</span>
        <span class="dialogContent" style="position:absolute;left:80px;">{{dcntr.infe}}</span>
        <span class="dialogtitle" style="position:absolute;left:140px;">箱重:</span>
        <span class="dialogContent" style="position:absolute;left:200px;">{{dcntr.ctgw}}</span>
      </div>
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">船上位置</span>
        <span class="dialogContent" style="position:absolute;left:100px;">{{dcntr.bayId}}</span>
        <span class="dialogContent" style="position:absolute;left:130px;">{{dcntr.indh}}</span>
        <span class="dialogContent" style="position:absolute;left:160px;">{{dcntr.clab}}</span>
        <span class="dialogContent" style="position:absolute;left:190px;">{{dcntr.elab}}</span>
      </div>
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">CWP信息</span>
        <span class="dialogContent" style="position:absolute;left:100px;">{{dcntr.qd}}</span>
        <span class="dialogContent" style="position:absolute;left:160px;">{{dcntr.cwp}}</span>
        <span class="dialogContent" style="position:absolute;left:190px;">{{dcntr.seq}}</span>
      </div>
      <div class="dialogLine" v-if="cntr.inTh">
        <span class="dialogtitle" style="position:absolute;left:20px;color:blue;">冷冻信息</span>
        <span class="dialogtitle" style="position:absolute;left:100px;color:blue;">温度</span>
        <span class="dialogtitle" style="position:absolute;left:160px;color:blue;">{{dcntr.th}}</span>
      </div>
      <div class="dialogLine" v-if="cntr.inOg">
        <span class="dialogtitle" style="position:absolute;left:20px;color:#ef9c49;">超限信息</span>
        <span class="dialogtitle" style="position:absolute;left:100px;color:#ef9c49;">上</span>
        <span
          class="dialogContent"
          style="position:absolute;left:125px;color:#ef9c49;"
          v-if="cntr.upOg"
        >{{cntr.upOg}}</span>
        <span class="dialogtitle" style="position:absolute;left:150px;color:#ef9c49;">左</span>
        <span
          class="dialogContent"
          style="position:absolute;left:175px;color:#ef9c49;"
          v-if="cntr.leftOg"
        >{{cntr.leftOg}}</span>
        <span class="dialogtitle" style="position:absolute;left:200px;color:#ef9c49;">右</span>
        <span
          class="dialogContent"
          style="position:absolute;left:225px;color:#ef9c49;"
          v-if="cntr.rightOg"
        >{{cntr.rightOg}}</span>
        <span class="dialogtitle" style="position:absolute;left:250px;color:#ef9c49;">前</span>
        <span
          class="dialogContent"
          style="position:absolute;left:275px;color:#ef9c49;"
          v-if="cntr.frontOg"
        >{{cntr.frontOg}}</span>
        <span class="dialogtitle" style="position:absolute;left:300px;color:#ef9c49;">后</span>
        <span
          class="dialogContent"
          style="position:absolute;left:325px;color:#ef9c49;"
          v-if="cntr.behindOg"
        >{{cntr.behindOg}}</span>
      </div>
      <div class="dialogLine" v-if="cntr.inHz">
        <span class="dialogtitle" style="position:absolute;left:20px;color:red;">危品信息</span>
        <span class="dialogtitle" style="position:absolute;left:100px;color:red;">代码</span>
        <span class="dialogContent" style="position:absolute;left:140px;color:red;">{{cntr.hz}}</span>
        <span class="dialogtitle" style="position:absolute;left:180px;color:red;">UN代码</span>
        <span class="dialogContent" style="position:absolute;left:250px;color:red;">{{cntr.hzun}}</span>        
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      dialogVisible: false,
      dcntr: ""
    };
  },
  props: [
    "cntr" //箱子
  ],
  watch: {
    cntr(val) {
      console.log(val);
      this.dcntr = val;
      this.dialogVisible = true;
    }
  }
};
</script>
<style scoped>
.dialogLine {
  position: relative;
  margin-top: 5px;
  height: 30px;
  line-height: 30px;
  background-color: beige;
}
.dialogtitle {
  font-size: 16px;
  color: #409eff;
}
.dialogContent {
  font-size: 16px;
}
</style>


