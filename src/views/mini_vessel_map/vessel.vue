<template>
  <div>
    <div>
      <el-button size="small" @click="inputOldVoy">指定航次</el-button>
      <el-select v-model="ypIndex" placeholder="请输入船舶代码" @change="vscdChg" size="small">
        <el-option v-for="(yp,index) in yps" :key="index" :label="yp.vscn" :value="index">
          <span style="float: left">{{ yp.vscd }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ yp.vscn }}</span>
        </el-option>
      </el-select>
      <el-input
        v-model="imvsvy"
        size="small"
        placeholder="进口航次"
        style="margin-left:5px;width:100px;"
        @keyup.native="chgUpper"
      ></el-input>
      <el-input
        v-model="exvsvy"
        size="small"
        placeholder="出口航次"
        style="margin-left:5px;width:100px;"
        @keyup.native="chgUpper"
      ></el-input>
      <TB width="80px" height="30px" caption="查询" :fun="loadData"></TB>     
    </div>
    <div style="margin-top:10px;">
      <el-tabs type="border-card">
        <el-tab-pane label="进口贝图">
          <imbay ref="imbay" :blist="im.bays"></imbay>
        </el-tab-pane>
        <el-tab-pane label="进口MINI图">
          <immini ref="immini"></immini>
        </el-tab-pane>
        <el-tab-pane label="出口贝图">
          <exbay ref="exbay" :blist="ex.bays"></exbay>
        </el-tab-pane>
        <el-tab-pane label="出口MINI图">
          <exmini ref="exmini"></exmini>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 老航次输入 -->
    <el-dialog title="航次输入" :visible.sync="voyDialogVisible" width="360px">
      <div>
        <span style="font-size:16px;">船舶代码</span>
        <el-input v-model="old_vscd" size="small" style="width:200px;margin-left:20px;"></el-input>
      </div>
      <div style="margin-top: 20px;">
        <span style="font-size:16px;">进口航次</span>
        <el-input v-model="old_imvsvy" size="small" style="width:200px;margin-left:20px;"></el-input>
      </div>
      <div style="margin-top: 20px;">
        <span style="font-size:16px;">出口航次</span>
        <el-input v-model="old_exvsvy" size="small" style="width:200px;margin-left:20px;"></el-input>
      </div>
      <div style="position:relative;height:30px;margin-top:20px;">
        <el-button type="success" style="float:right;" size="mini" @click="loadOldData">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ImportBayCom from "./importBayComponent";
import ExportBayCom from "./exportBayComponent";
import ImportMiniCom from "./importMiniComponent";
import ExportMiniCom from "./exportMiniComponent"
import { getImportBays, getExportBays, getYP } from "@/api/api";
import GB from "@/global";
import V from "./VesselUtils";
import TB from "./timeButtomComponent";

export default {
  data() {
    return {
      voyDialogVisible: false,
      yps: [], //预排信息
      ypIndex: "", //
      vscd: "",
      imvsvy: "",
      exvsvy: "",
      old_vscd: "",
      old_imvsvy: "",
      old_exvsvy: "",
      im: {
        hatchs: [],
        bays: []
      },
      ex: {
        hatchs: [],
        bays: []
      },
      myloading: false
    };
  },
  methods: {
    chgUpper() {
      this.vscd = this.vscd.toUpperCase();
    },
    inputOldVoy() {
      this.voyDialogVisible = true;
    },
    vscdChg(index) {
      let yp = this.yps[index];
      this.vscd = yp.vscd;
      this.imvsvy = yp.vsvyim;
      this.exvsvy = yp.vsvyex;
    },
    loadOldData() {
      let me = this;
      me.yps.push({
        vscd: me.old_vscd.toUpperCase(),
        vsvyim: me.old_imvsvy.toUpperCase(),
        vsvyex: me.old_exvsvy.toUpperCase(),
        vscn: me.old_vscd.toUpperCase()
      });
      me.ypIndex = me.yps.length - 1;
      me.vscd = me.old_vscd.toUpperCase();
      me.imvsvy = me.old_imvsvy.toUpperCase();
      me.exvsvy = me.old_exvsvy.toUpperCase();
      me.voyDialogVisible = false;
    },
    loadData() {
      let me = this;
      if (
        GB.isEmpty(me.vscd) ||
        GB.isEmpty(me.imvsvy) ||
        GB.isEmpty(me.exvsvy)
      ) {
        this.$message({
          message: "请先输入船舶代码和船名航次",
          type: "error"
        });
        return;
      }
      let param = {
        vscd: me.vscd,
        imvsvy: me.imvsvy,
        exvsvy: me.exvsvy
      };
      //1.载入进口船图
      me.im.hatchs = [];
      me.im.bays = [];
      me.myloading = true;
      getImportBays(param).then(res => {
        let { flag, data, errMsg, outMsg } = res;
        if (flag) {
          me.im.hatchs = data.hatchs;
          me.im.liveHatch = data.liveHatch;
          me.im.qds = data.qds;
          me.im.cwps = data.cwps;
          me.im.cwps.forEach(function(qd) {
            qd.children.forEach(function(cwp) {
              delete cwp["children"];
            });
          });
          if (GB.isEmpty(me.im.hatchs)) {
            throw "找不到" + me.vscd + "的船模";
          }
          me.im.hatchs.forEach(function(h) {
            h.bays.forEach(function(b) {
              V.initBay(b);
              me.im.bays.push(b);
            });
          });
          V.setOgNeighborFlag(me.im.hatchs);
          me.myloading = false;
          me.$refs.immini.rcv(me.im);
          this.$message({
            message: "载入进口数据成功",
            type: "success"
          });
        } else {
          me.myloading = false;
          this.$message({
            message: errMsg,
            type: "error"
          });
        }
      });
      /** 
        .catch(err => {
          this.$message({
            message: err,
            type: "error"
          }); 
        });
        */
      //2.载入出口船图
      me.ex.hatchs = [];
      me.ex.bays = [];
      me.myloading = true;
      getExportBays(param).then(res => {
        let { flag, data, errMsg, outMsg } = res;
        if (flag) {
          me.ex.hatchs = data.hatchs;
          me.ex.ports = data.ports;
          me.ex.qds = data.qds;
          me.ex.cwps = data.cwps;
          me.ex.cwps.forEach(function(qd) {
            qd.children.forEach(function(cwp) {
              delete cwp["children"];
            });
          });
          me.initQds;
          if (GB.isEmpty(me.ex.hatchs)) {
            throw "找不到" + me.vscd + "的船模";
          }
          me.ex.hatchs.forEach(function(h) {
            h.bays.forEach(function(b) {
              V.initBay(b);
              me.ex.bays.push(b);
            });
          });
          V.setOgNeighborFlag(me.im.hatchs);
          me.myloading = false;
          me.$refs.exmini.rcv(me.ex);
          this.$message({
            message: "载入出口数据成功",
            type: "success"
          });
        } else {
          me.myloading = false;
          this.$message({
            message: errMsg,
            type: "error"
          });
        }
      });
      /*
        .catch(err => {
          this.$message({
            message: err,
            type: "error"
          });
        });
        */
      //3.更改父组件标题栏
      //这种传值方式将子组件与父组件耦合了,导致无法释放,所以不推荐使用
      //this.$parent.$parent.$parent.chgTitle(param);
      this.$emit("chgTitle", param);
    }
  },
  components: {
    imbay: ImportBayCom,
    exbay: ExportBayCom,
    immini: ImportMiniCom,
    exmini: ExportMiniCom,
    TB
  },
  mounted() {
    let me = this;
    getYP({ date: GB.dateToInt(new Date()) }).then(res => {
      let { flag, data, errMsg, outMsg } = res;
      if (flag) {
        me.yps = data;
      } else {
        me.myloading = false;
        this.$message({
          message: errMsg,
          type: "error"
        });
      }
    });
  },
  deactivated() {
    console.log("vessel deactivated");
  },
  beforeDestroy() {
    this.im.hatchs = null;
    this.im.bays = null;
    this.ex.hatchs = null;
    this.ex.bays = null;

    this.$refs.immini = null;
    this.$refs.exmini = null;
    this.$refs.imbay = null;
    this.$refs.exbay = null;

    //加了这个效果特好，不知道为什么
    this.$parent.$parent.$parent = null;
    this.$parent.$parent = null;
    this.$parent = null;

    console.log("vessel beforeDestroy");
  },
  destroyed() {
    console.log("vessel destroyed");
  }
};
</script>

<style scoped>
</style>