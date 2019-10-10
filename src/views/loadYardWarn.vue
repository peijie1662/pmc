<template>
  <div>
    <div></div>
    <div ref="lywdiv"></div>
    <!-- 延后设置窗口 -->
    <el-dialog title="延后设置" :visible.sync="delayDialogVisible" width="300px">
      <div style="height:200px;">
        <div>
          <div v-if="delayCntr.isDelay">
            <span style="color:red;">已设置延后</span>
            <el-button size="mini" @click="cancelDelay" style="margin-left:20px;">取消</el-button>
          </div>
          <span v-if="!delayCntr.isDelay" style="color:green;">未设置延后</span>
        </div>
        <div style="margin-top:20px;">
          <span>延后到:</span>
          <el-date-picker
            v-model="delayDt"
            type="datetime"
            placeholder="选择日期时间"
            size="mini"
            @change="delayChg"
            style="width:200px;"
          ></el-date-picker>
        </div>
      </div>
    </el-dialog>
    <!-- 桥吊设置窗口 -->
    <el-dialog title="桥吊设置" :visible.sync="qdDialogVisible" width="350px">
      <div slot="title" class="header-title">
        <span>桥吊设置({{qd.qdno}})</span>
      </div>
      <!-- 航次忽略设置 -->
      <div style="border: 1px solid black;padding:10px;">
        <div>航次忽略设置：</div>
        <el-checkbox
          v-for="(item,index) in qdVoys"
          :key="index"
          v-model="item.checked"
          @change="voySelChg(item)"
        >{{item.voy}}</el-checkbox>
      </div>
      <!-- 未激活CWP添加 -->
      <div style="border: 1px solid black;padding:10px;margin-top:10px;">
        <div>CWP添加：</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getLywQds, getLywActiveQueues } from "../api/api";
import GB from "../global.vue";
import L from "../LywUtils.vue";

export default {
  data() {
    return {
      stage: null,
      layer: null,
      qdSeq: [], //桥吊顺序
      activeQueues: [], //激活队列
      drawQueues: [], //可绘制队列，即经过刻度转换后队列。
      //
      delay: {}, //延后时间设置
      delayDialogVisible: false,
      delayCntr: "",
      delayDt: "",
      //
      qd: "",
      qdDialogVisible: false,
      qdVoys: [],
      voyNoSel: ""
    };
  },
  methods: {
    voySelChg(item) {
      let me = this;
      if (item.checked) {
        me.voyNoSel.delete(item.voy);
      } else {
        me.voyNoSel.add(item.voy);
      }
      sessionStorage.setItem(
        "voyNoSel",
        JSON.stringify([...me.voyNoSel.values()])
      );
      me.mainfun();
    },
    showQdDialog(qd) {
      let me = this;
      me.qdDialogVisible = true;
      me.qdVoys = [];
      let dq = me.drawQueues.filter(item => {
        return item.qdno == qd.qdno;
      })[0];
      if (dq) {
        me.qdVoys = dq.voys;
      }
      me.qd = qd;
    },
    showDelayDialog(cntr) {
      let me = this;
      me.delayDialogVisible = true;
      me.delayCntr = cntr;
      me.delayDt = cntr.opDate;
    },
    cancelDelay() {
      let me = this;
      delete me.delay[me.delayCntr.key];
      sessionStorage.setItem("delay", JSON.stringify(me.delay));
      me.delayDialogVisible = false;
      me.mainfun();
    },
    delayChg() {
      let me = this;
      let curTime = new Date();
      if (me.delayDt < curTime) {
        me.$message({
          message: "延后时间不能早于当前时间.",
          type: "error"
        });
        return;
      }
      me.delay[me.delayCntr.key] = me.delayDt;
      sessionStorage.setItem("delay", JSON.stringify(me.delay));
      me.delayDialogVisible = false;
      me.mainfun();
    },
    //初始化图纸
    init() {
      let me = this;
      if (me.stage) {
        me.stage.clear();
        me.stage.destroy();
      }
      let c = me.$refs.lywdiv;
      me.stage = new Konva.Stage({
        container: c,
        width: L.C.stage_width,
        height: L.C.stage_height
      });
      me.layer = new Konva.Layer();
      me.stage.add(me.layer);
    },
    //绘制桥吊及队列
    drawQds() {
      let me = this;
      me.layer.clear();
      L.drawTimeline(me.layer,me.drawQueues);
      me.drawQueues.forEach((dq, index) => {
        let qd = {
          qdno: dq.qdno,
          x: L.C.qd_begin_x + (L.C.qd_width + L.C.qd_interval) * index,
          y: L.C.qd_begin_y
        };
        L.drawQd(me.layer, qd, me.showQdDialog);
        let ss = dq.scales;
        ss.forEach(item => {
          L.drawScale(me.stage, me.layer, qd, item, me.showDelayDialog);
        });
      });
      me.layer.draw();
    },
    //计算激活的装卸时间点，同时计算延时
    calculateTime() {
      let me = this;
      me.activeQueues.forEach(aq => {
        let preTime = new Date(); //上一个箱的时间点
        aq.queue.forEach(cntr => {
          cntr.isConflict = false;
          cntr.conflict = [];
          let voyKey = cntr.vscd + "/" + cntr.vsvy + "-" + cntr.vsdr;
          cntr.isIgnore = me.voyNoSel.has(voyKey); //标记忽略
          let dt = me.delay[cntr.key];
          if (dt) {
            cntr.isDelay = true;
            cntr.opDate = new Date(dt);
            preTime = new Date(dt);
          } else {
            cntr.isDelay = false;
            cntr.opDate = new Date(
              preTime.setMinutes(preTime.getMinutes() + L.C.common_eff)
            );
          }
        });
      });
    },
    //激活队列转为可绘制队列
    convertDrawQueues() {
      let me = this;
      let curTime = new Date();
      me.drawQueues = [];
      me.activeQueues.forEach(item => {
        //1.初始化桥吊下所有刻度
        let scaleTime = new Date();
        let newItem = { qdno: item.qdno, voys: [], scales: [] };
        let maxScale = L.C.time_length / L.C.scale_min;
        for (let i = 0; i <= maxScale; i++) {
          scaleTime = new Date(
            scaleTime.setMinutes(scaleTime.getMinutes() + L.C.scale_min)
          );
          newItem.scales.push({
            scaleNode: i,
            scaleTime: scaleTime,
            cntrs: []
          });
        }
        //2.计算冲突
        let calTime = new Date();
        for (let i = 0; i <= L.C.time_length; i++) {
          calTime.setMinutes(calTime.getMinutes() + 1);
          //2.1找到潜在冲突集
          let calCntrs = [];
          me.activeQueues.forEach(item => {
            let cs = item.queue.filter(cntr => {
              return (
                Math.abs(cntr.opDate - calTime) / 1000 / 60 <=
                  L.C.conflict_min / 2 && !cntr.isIgnore
              );
            });
            calCntrs = calCntrs.concat(cs);
          });
          //2.2计算冲突
          calCntrs.forEach(cntr => {
            let conflict = calCntrs.filter(c => {
              let bay_interval = Math.abs(cntr.fmrw - c.fmrw);
              if ((cntr.fmrw + c.fmrw) % 2 == 1) {
                bay_interval -= 1;
              }
              return (
                cntr.qdno != c.qdno && cntr.fmst == c.fmst && bay_interval <= 4
              );
            });
            if (conflict.length > 0) {
              cntr.isConflict = true;
              cntr.conflict = conflict;
            }
          });
        }
        //3.归并到刻度，并检查是否忽略
        item.queue.forEach(cntr => {
          //归并
          let node = Math.round(
            (cntr.opDate - curTime) / 1000 / 60 / L.C.scale_min
          );
          if (node <= maxScale) {
            newItem.scales[node].cntrs.push(cntr);
          }
        });
        //4.统计桥吊下航次
        item.queue.forEach(cntr => {
          let val = cntr.vscd + "/" + cntr.vsvy + "-" + cntr.vsdr;
          let vs = newItem.voys.filter(item => {
            return item.voy == val;
          });
          if (vs.length == 0) {
            if (me.voyNoSel.has(val)) {
              newItem.voys.push({ voy: val, checked: false });
            } else {
              newItem.voys.push({ voy: val, checked: true });
            }
          }
        });
        //5.保存到可绘制
        me.drawQueues.push(newItem);
      });
    },
    loadQds() {
      let me = this;
      return new Promise((resolve, reject) => {
        getLywQds({})
          .then(res => {
            let { flag, data, errMsg } = res;
            if (flag) {
              me.qdSeq = data;
              resolve(data);
            } else {
              reject(errMsg);
            }
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    loadLywActiveQueues() {
      let me = this;
      return new Promise((resolve, reject) => {
        getLywActiveQueues({})
          .then(res => {
            let { flag, data, errMsg } = res;
            if (flag) {
              //1.激活队列排序
              me.activeQueues = [];
              me.qdSeq.forEach(qd => {
                if (data[qd.qd]) {
                  me.activeQueues.push({ qdno: qd.qd, queue: data[qd.qd] });
                }
              });
              me.mainfun();
              resolve(data);
            } else {
              reject(errMsg);
            }
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    mainfun() {
      this.init();
      //1.激活队列计算时间点
      this.calculateTime();
      //2.激活队列转为可绘制队列
      this.convertDrawQueues();
      //3.绘制
      this.drawQds();
    }
  },
  mounted() {
    let me = this;
    //1.保存的延后时间
    let delay = sessionStorage.getItem("delay");
    if (delay) {
      me.delay = JSON.parse(delay);
    }
    //2.保存的忽略航次
    let voyNoSel = sessionStorage.getItem("voyNoSel");
    me.voyNoSel = new Set();
    if (voyNoSel) {
      if (voyNoSel.length > 0) {
        me.voyNoSel = new Set(JSON.parse(voyNoSel));
      }
    }
    //3.读数据
    me.init();
    Promise.all([me.loadQds(), me.loadLywActiveQueues()])
      .then()
      .catch(err => {
        console.info(err);
      });
  }
};
</script>

<style scoped>
</style>