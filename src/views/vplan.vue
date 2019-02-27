<template>
  <div>
    <div class="header">
      <span style="margin-top:10px;margin-left:20px;">预排日期</span>
      <el-date-picker
        v-model="predate"
        type="date"
        placeholder="选择日期"
        style="margin-top:10px;margin-left:10px;width:180px;"
        size="small"
        @change="dateChg"
      ></el-date-picker>
      <el-button
        type="primary"
        size="small"
        plain
        @click="dateChg"
        style="margin-top:10px;margin-left:10px;width:80px;"
      >预排信息</el-button>
      <el-button
        type="primary"
        size="small"
        plain
        style="margin-top:10px;margin-left:10px;width:80px;"
        @click="showYbDialog"
      >预报信息</el-button>
      <el-slider
        v-model="scaleVal"
        show-input
        style="display:inline-block;width:320px;position:absolute; top:6px;left:480px;"
        @change="scaleChg"
      ></el-slider>
    </div>
    <div ref="vplan"></div>
    <el-dialog title="航次信息" :visible.sync="dialogVisible" width="600px">
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">船名:</span>
        <span
          class="dialogContent"
          style="position:absolute;left:80px;"
        >{{dialogVessel.vscn}} / {{dialogVessel.vsen}}</span>
      </div>
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">航次:</span>
        <span
          class="dialogContent"
          style="position:absolute;left:80px;"
        >{{dialogVessel.vscd}} - {{dialogVessel.vsvyim}} / {{dialogVessel.vsvyex}}</span>
      </div>
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">泊位:</span>
        <span class="dialogContent" style="position:absolute;left:80px;">{{dialogVessel.btno}}</span>
        <span class="dialogtitle" style="position:absolute;left:280px;">船长:</span>
        <span class="dialogContent" style="position:absolute;left:340px;">{{dialogVessel.vslen}}</span>
      </div>
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">船头:</span>
        <span class="dialogContent" style="position:absolute;left:80px;">{{dialogVessel.vsstart}}</span>
        <span class="dialogtitle" style="position:absolute;left:280px;">船尾:</span>
        <span class="dialogContent" style="position:absolute;left:340px;">{{dialogVessel.vsend}}</span>
      </div>
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">进口箱量:</span>
        <span class="dialogContent" style="position:absolute;left:100px;">{{dialogVessel.vsstart}}</span>
        <span class="dialogtitle" style="position:absolute;left:280px;">出口箱量:</span>
        <span class="dialogContent" style="position:absolute;left:360px;">{{dialogVessel.vsend}}</span>
      </div>
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">抵港时间:</span>
        <span class="dialogContent" style="position:absolute;left:100px;">{{dialogVessel.ardttm}}</span>
      </div>
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">靠泊时间:</span>
        <span class="dialogContent" style="position:absolute;left:100px;">{{dialogVessel.ibdttm}}</span>
      </div>
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">离泊时间:</span>
        <span class="dialogContent" style="position:absolute;left:100px;">{{dialogVessel.obdttm}}</span>
      </div>
      <div class="dialogLine">
        <span class="dialogtitle" style="position:absolute;left:20px;">航线:</span>
        <span class="dialogContent" style="position:absolute;left:100px;">{{dialogVessel.vssv}}</span>
      </div>
    </el-dialog>
    <el-dialog title="预报信息" :visible.sync="YbDialogVisible" width="900px">
      <el-table :data="ybs" stripe style="width: 100%">
        <el-table-column prop="cnm" label="中文船名" width="180"></el-table-column>
        <el-table-column prop="vssv" label="航线" width="80"></el-table-column>
        <el-table-column prop="xl" label="进出箱量" width="80"></el-table-column>
        <el-table-column prop="dgsj" label="抵港时间" width="100"></el-table-column>
        <el-table-column prop="banqi" label="班期" width="100"></el-table-column>
        <el-table-column prop="dbsj" label="等泊时间" width="100"></el-table-column>
        <el-table-column prop="rm" label="备注" width="250"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<style scoped>
.header {
  height: 50px;
  overflow: hidden;
  background: #f5f7fa;
  padding-right: 50px;
  position: relative;
}
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
<script>
import GB from "../global.vue";
import V from "../VplanUtils.vue";
import { getYP, getYB } from "../api/api";

export default {
  data() {
    return {
      YbDialogVisible: false, //预报对话框
      dialogVisible: false, //航次属性对话框
      dialogVessel: "",
      stage: null,
      layer: null,
      scaleVal: 100,
      predate: new Date(), //预排时间
      scaleVal: 100, //缩放比例
      yps: [], //预排数据
      ybs: [] //预报数据
    };
  },
  methods: {
    showYbDialog() {
      this.YbDialogVisible = true;
    },
    init() {
      let me = this;
      if (!me.stage) {
        let c = me.$refs.vplan;
        me.stage = new Konva.Stage({
          container: c,
          width: V.Constant.getCV("CANVASWIDTH"),
          height: V.Constant.getCV("CANVASHEIGHT")
        });
        me.layer = new Konva.Layer();
        me.stage.add(me.layer);
        V.paintY(me.layer);
        V.paintX(me.layer);
      }
    },
    compeleteDestroy() {
      if (this.stage != null) {
        let shapes = this.stage.find("Shape");
        shapes.forEach(function(shape) {
          shape.destroy();
        });
        this.layer.destroy();
        this.stage.destroy();
        this.layer = null;
        this.stage = null;
        console.log("vplan release");
      }
    },
    dateChg() {
      this.compeleteDestroy();
      this.loadData();
    },
    scaleChg() {
      let me = this;
      me.layer.scale({ x: me.scaleVal / 100, y: me.scaleVal / 100 });
      me.layer.draw();
    },
    showDialog(vessel) {
      let me = this;
      me.dialogVisible = true;
      me.dialogVessel = vessel;
    },
    loadData() {
      let me = this;
      me.init();
      let d = GB.dateToInt(me.predate) + "";
      V.Constant.setPageDate(d);
      getYP({ date: d }).then(res => {
        let { flag, data, errMsg, outMsg } = res;
        if (flag) {
          me.yps = data;
          me.yps.forEach(function(vessel) {
            vessel["ardttm"] = GB.convertDHM(vessel.ardate, vessel.artime);
            vessel["ibdttm"] = GB.convertDHM(vessel.ibdt, vessel.ibtm);
            vessel["obdttm"] = GB.convertDHM(vessel.obdt, vessel.obtm);
            V.paintVessel(me.layer, vessel, me.showDialog);
          });
          me.layer.scale({ x: me.scaleVal / 100, y: me.scaleVal / 100 });
          me.layer.draw();
        } else {
          me.$message({
            message: errMsg,
            type: "error"
          });
        }
      });
      getYB({ date: d }).then(res => {
        let { flag, data, errMsg, outMsg } = res;
        if (flag) {
          me.ybs = data;
          console.log(me.ybs)
        } else {
          me.$message({
            message: errMsg,
            type: "error"
          });
        }
      });
    },
    disBackground() {
      let me = this;
      me.init();
      me.layer.scale({ x: me.scaleVal / 100, y: me.scaleVal / 100 });
      me.layer.draw();
    }
  },
  mounted() {
    this.disBackground();
    this.loadData();
  },
  beforeDestroy() {
    this.dialogVessel = null;
    this.yps = null;
    this.compeleteDestroy();
  }
};
</script>

