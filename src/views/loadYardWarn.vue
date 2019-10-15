<template>
  <div>
    <div class="header">
      <el-checkbox v-model="hideIm" @change="mainfun">隐藏进口队列桥吊</el-checkbox>
      <el-button
        size="mini"
        @click="cwpDialogVisible = true"
        style="margin-left:50px;width:100px;"
      >+ CWP</el-button>
      <el-button
        size="mini"
        @click="efficentDialogVisible = true"
        style="margin-left:5px;width:100px;"
      >效率</el-button>
      <el-radio-group v-model="showType" size="mini" @change="mainfun" style="margin-left:30px;">
        <el-radio-button label="circle">简图</el-radio-button>
        <el-radio-button label="cwp_rect">CWP</el-radio-button>
        <el-radio-button label="loc_rect">场地</el-radio-button>
      </el-radio-group>
      <el-button size="mini" style="margin-left:50px;width:100px;">刷新</el-button>
    </div>
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
      <div class="dialogsection">
        <div>出口航次忽略设置：</div>
        <el-checkbox
          v-for="(item,index) in qdVoys"
          :key="index"
          v-model="item.checked"
          @change="voySelChg(item)"
        >{{item.voy}}</el-checkbox>
      </div>
    </el-dialog>
    <!-- 桥吊CWP设置窗口 -->
    <el-dialog title="桥吊CWP设置" :visible.sync="cwpDialogVisible" width="70%">
      <AddCwp :qds="qdSeq" @addQdPendingCwps="addQdPendingCwps"></AddCwp>
    </el-dialog>
    <!-- 效率设置窗口 -->
    <el-dialog title="桥吊效率设置" :visible.sync="efficentDialogVisible" width="70%">
      <Efficent></Efficent>
    </el-dialog>
  </div>
</template>

<script>
import { getLywQds, getLywActiveQueues, getLywPendingCntrs } from "../api/api";
import GB from "../global.vue";
import L from "../LywUtils.vue";
import AddCwp from "./addCwpComponent.vue";
import Efficent from "./qdEfficent.vue";

export default {
  data() {
    return {
      stage: null,
      layer: null,
      hideIm: true,
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
      voyNoSel: "",
      //
      cwpDialogVisible: false,
      efficentDialogVisible: false,
      //
      showType: L.C.show_type.circle
    };
  },
  methods: {
    addQdPendingCwps(qdCwps) {
      let me = this;
      //追加前删除所有追加项，否则会重复。
      me.activeQueues.forEach(aq => {
        aq.queue = aq.queue.filter(c => {
          return c.jbst != "PD";
        });
      });
      //开始追加
      if (qdCwps) {
        let ps = [];
        qdCwps.forEach(qd => {
          if (qd.pendingCwps.length > 0) {
            let p = new Promise((resolve, reject) => {
              getLywPendingCntrs(qd.pendingCwps).then(res => {
                let { flag, data, errMsg } = res;
                if (flag) {
                  let aq = me.activeQueues.filter(aq => {
                    return aq.qdno == qd.qdno;
                  })[0];
                  if (aq) {
                    //已有桥吊，就追加队列
                    aq.queue = aq.queue.concat(data);
                  } else {
                    //没有桥吊，新建队列
                    me.activeQueues.push({ qdno: qd.qdno, queue: data });
                    //按桥吊排序
                    let tmpArr = [];
                    me.qdSeq.forEach(qd => {
                      let tmpAq = me.activeQueues.filter(aq => {
                        return aq.qdno == qd.qdno;
                      })[0];
                      if (tmpAq) {
                        tmpArr.push(tmpAq);
                      }
                    });
                    me.activeQueues = tmpArr;
                  }
                  resolve();
                } else {
                  reject(errMsg);
                }
              });
            });
            ps.push(p);
          }
        });
        if (ps.length > 0) {
          Promise.all(ps)
            .then(res => {
              me.mainfun();
            })
            .catch(err => {
              console.info("addQdPendingCwps err:" + err);
            });
        } else {
          //可能是清除操作，也需要重绘
          me.mainfun();
        }
      }
      me.cwpDialogVisible = false;
    },
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
      L.drawTimeline(me.layer, me.drawQueues);
      let drawIndex = 0;
      me.drawQueues.forEach((dq, index) => {
        if (!(dq.isOnlyIm && me.hideIm)) {
          let qd = {
            qdno: dq.qdno,
            x: L.C.qd_begin_x + (L.C.qd_width + L.C.qd_interval) * drawIndex,
            y: L.C.qd_begin_y
          };
          L.drawQd(me.layer, qd, me.showQdDialog);
          let ss = dq.scales;
          ss.forEach(item => {
            L.drawScale(
              me.stage,
              me.layer,
              qd,
              item,
              me.showType,
              me.showDelayDialog
            );
          });
          drawIndex += 1;
        }
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
          cntr.isVesselLast = false;
          cntr.conflict = [];
          let voyKey = cntr.vscd + "/" + cntr.vsvy + "-" + cntr.vsdr;
          cntr.isIgnore = me.voyNoSel.has(voyKey) || cntr.vsdr == "I"; //标记忽略
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
      //标记某船的最后一个箱
      me.activeQueues.forEach(aq => {
        let vessel = "";
        for (let i = aq.queue.length - 1; i >= 0; i--) {
          let c = aq.queue[i];
          if (c.vscd != vessel) {
            c.isVesselLast = true;
            vessel = c.vscd;
          }
        }
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
        let newItem = {
          qdno: item.qdno,
          isOnlyIm: true, //只有进口
          voys: [],
          scales: []
        };
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
          if (cntr.vsdr == "E") {
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
          }
        });
        //5.桥吊下队列属性
        item.queue.forEach(cntr => {
          if (cntr.vsdr == "E") {
            newItem.isOnlyIm = false;
          }
        });
        //6.保存到可绘制
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
                if (data[qd.qdno]) {
                  me.activeQueues.push({ qdno: qd.qdno, queue: data[qd.qdno] });
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
  },
  components: {
    AddCwp,
    Efficent
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
  margin-top: 10px;
  border-radius: 5px;
  border: 1px solid #c0c4cc;
  padding: 10px;
}
</style>