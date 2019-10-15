<template>
  <div>
    <div>
      <!-- 选项 -->
      <div>
        <span>船名：</span>
        <el-input v-model="filterVscd" size="mini" style="width:200px;"></el-input>
        <span>航次：</span>
        <el-input v-model="filterVsvy" size="mini" style="width:200px;"></el-input>
        <span>CWP：</span>
        <el-input-number v-model="filterCwpn" size="mini" :min="0"></el-input-number>
        <el-button size="mini" @click="defaultLoad">配载默认</el-button>
        <el-button size="mini" @click="clearQdCwps">全部取消</el-button>
      </div>
      <!-- 待选CWP -->
      <div class="dialogsection" style="height:300px;">
        <div
          v-for="(cwp,index) in noQdPendingCwps"
          :key="index"
          class="cwp"
          @click="selCwp(cwp)"
        >{{cwp.key}}</div>
      </div>
      <!-- 桥吊CWP -->
      <div class="dialogsection" style="height:300px;">
        <div v-for="(qd,index) in qdCwps" :key="index" class="qd">
          <div style="text-align:center;background:#409EFF;color:white;">
            <span>{{qd.qdno}}</span>
          </div>
          <draggable @end="listChange">
            <div v-for="cwp in qdCwps[index].pendingCwps" :key="cwp.key" class="cwp">
              <span>{{cwp.key}}</span>
              <i
                class="iconfont icon-delete icon"
                @click="noSelCwp(cwp)"
                style="color:#FF5500;float:right;"
              ></i>
            </div>
          </draggable>
        </div>
      </div>
      <div style="overflow:hidden;">
        <el-button
          size="small"
          @click="cwpsOk"
          style="float:right;margin-right:10px;margin-top:10px;"
        >确定</el-button>
        <el-button
          size="small"
          @click="cwpsCancel"
          style="float:right;margin-right:10px;margin-top:10px;"
        >取消</el-button>
      </div>
      <!-- 添加CWP窗口 -->
      <el-dialog title="添加CWP" :visible.sync="addCwpDialogVisible" append-to-body>
        <h3>将CWP: {{addCwp.key}} 添加到：</h3>
        <el-radio-group v-model="addQd" size="mini" @change="addCwpToQd">
          <el-radio-button v-for="(qd,index) in qdCwps" :key="index" :label="qd.qdno"></el-radio-button>
        </el-radio-group>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { getLywPendingCwps } from "../api/api";
import draggable from "vuedraggable";

export default {
  data() {
    return {
      filterVscd: "",
      filterVsvy: "",
      filterCwpn: 0,
      //
      qdCwps: [], //传入桥吊列表
      pendingCwps: [], //载入的CWP数据
      //
      addCwp: "",
      addQd: "",
      addCwpDialogVisible: false
    };
  },
  computed: {
    noQdPendingCwps() {
      let me = this;
      return me.pendingCwps.filter(pc => {
        let r = pc.actualQd == "";
        if (me.filterVscd != "") {
          me.filterVscd = me.filterVscd.toUpperCase();
          r = r && pc.vscd.indexOf(me.filterVscd) >= 0;
        }
        if (me.filterVsvy != "") {
          me.filterVsvy = me.filterVsvy.toUpperCase();
          r = r && pc.vsvy.indexOf(me.filterVsvy) >= 0;
        }
        if (me.filterCwpn > 0) {
          r = r && pc.cwpn == me.filterCwpn;
        }
        return r;
      });
    }
  },
  props: {
    qds: {
      type: Array,
      default: []
    }
  },
  methods: {
    listChange(e) {
      let me = this;
      let arr = [];
      e.from.childNodes.forEach(n => {
        me.qdCwps.forEach(qd => {
          qd.pendingCwps.forEach(pc => {
            if (pc.key == n.innerText) {
              arr.push(pc);
            }
          });
        });
      });
      if (arr.length > 0) {
        let qd = me.qdCwps.filter(qd => {
          return qd.qdno == arr[0].actualQd;
        })[0];
        qd.pendingCwps = arr;
      }
    },
    cwpsOk() {
      let me = this;
      me.$emit("addQdPendingCwps", me.qdCwps);
    },
    cwpsCancel() {
      let me = this;
      me.$emit("addQdPendingCwps", null);
    },
    createQdCwps() {
      let me = this;
      me.qdCwps.forEach(qd => {
        qd.pendingCwps = me.pendingCwps.filter(pc => {
          return pc.actualQd == qd.qdno;
        });
      });
    },
    clearQdCwps() {
      let me = this;
      me.pendingCwps.forEach(pc => {
        pc.actualQd = "";
      });
      me.createQdCwps();
    },
    defaultLoad() {
      let me = this;
      me.noQdPendingCwps.forEach(pc => {
        pc.actualQd = pc.qdno;
      });
      me.createQdCwps();
    },
    noSelCwp(cwp) {
      let me = this;
      cwp.actualQd = "";
      me.createQdCwps();
    },
    selCwp(cwp) {
      let me = this;
      me.addCwp = cwp;
      me.addCwpDialogVisible = true;
    },
    addCwpToQd() {
      let me = this;
      me.addCwp.actualQd = me.addQd;
      me.createQdCwps();
      me.addCwp = "";
      me.addQd = "";
      me.addCwpDialogVisible = false;
    },
    loadCwps() {
      let me = this;
      getLywPendingCwps({})
        .then(res => {
          let { flag, data, errMsg } = res;
          if (flag) {
            me.pendingCwps = data.map(item => {
              return {
                ...item,
                actualQd: "",
                key:
                  item.vscd +
                  "/" +
                  item.vsvy +
                  "-" +
                  item.vsdr +
                  ":" +
                  item.qdno +
                  ":" +
                  item.cwpn
              };
            });
          } else {
            me.$message({
              message: errMsg,
              type: "error"
            });
          }
        })
        .catch(err => {
          me.$message({
            message: err,
            type: "error"
          });
        });
    }
  },
  components: {
    draggable
  },
  mounted() {
    this.qdCwps = [...this.qds];
    this.loadCwps();
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
.dialogsection {
  overflow: scroll;
  margin-top: 10px;
  border-radius: 5px;
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
.cwp {
  font-size: 10px;
  width: 180px;
  height: 20px;
  border: 1px solid #c0c4cc;
  float: left;
  margin: 2px;
  cursor: default;
}
</style>