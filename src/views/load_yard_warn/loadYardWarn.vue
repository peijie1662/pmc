<template>
  <div>
    <div class="header">
      <el-checkbox v-model="hideIm" @change="mainfun">隐藏进口队列桥吊</el-checkbox>
      <el-button
        size="mini"
        @click="cwpDialogVisible = true"
        style="margin-left:30px;width:80px;"
      >+ CWP</el-button>
      <el-button size="mini" @click="showEfficent" style="margin-left:0;width:60px;">效率</el-button>
      <el-button size="mini" @click="showConflict" style="margin-left:0;width:60px;">冲突</el-button>
      <!-- 时间长度下拉框 -->
      <el-select
        v-model="timeline_length"
        size="mini"
        @change="mainfun"
        style="width:100px;margin-left:10px;"
      >
        <el-option
          v-for="item in timeline_options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-button size="mini" icon="el-icon-upload2" @click="saveSetting" style="margin-left:20px;"></el-button>
      <!-- 设置列表下拉框 -->
      <el-select
        v-model="settingSel"
        @visible-change="getSettingList"
        size="mini"
        style="width:100px;margin-left:10px;"
      >
        <el-option
          v-for="item in settingList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-button size="mini" icon="el-icon-download" @click="getSetting" style="margin-left:0;"></el-button>
      <el-button size="mini" icon="el-icon-document" @click="showStatistic" style="margin-left:0;"></el-button>
      <el-button
        size="mini"
        icon="el-icon-picture-outline"
        @click="saveToPicture"
        style="margin-left:0;"
      ></el-button>
      <!-- 显示切换 -->
      <el-radio-group v-model="showType" size="mini" @change="mainfun" style="margin-left:30px;">
        <el-radio-button label="circle">简图</el-radio-button>
        <el-radio-button label="cwp_rect">CWP</el-radio-button>
        <el-radio-button label="loc_rect">场地</el-radio-button>
      </el-radio-group>
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
      <Efficent :qds="qdSeq" :aqs="efficentAqs" @efficentChange="efficentChange"></Efficent>
    </el-dialog>
    <!-- 冲突设置窗口 -->
    <el-dialog title="冲突设置" :visible.sync="conflictDialogVisible">
      <Conflict :conflict="newConflict" @conflictChange="conflictChange"></Conflict>
    </el-dialog>
    <!-- 堆场统计窗口 -->
    <el-dialog title="堆场装船统计" :visible.sync="yardStatisticVisible">
      <yard-statistic :aqs="statisticAqs"></yard-statistic>
    </el-dialog>
  </div>
</template>

<script>
import {
  getLywQds,
  getLywActiveQueues,
  getLywPendingCntrs,
  addSetting,
  getSetting,
  getSettingList
} from "@/api/api";
import GB from "@/global.vue";
import L from "./LywUtils.vue";
import AddCwp from "./addCwpComponent.vue";
import Efficent from "./qdEfficent.vue";
import Conflict from "./conflictSet.vue";
import YardStatistic from "./yardStatistic.vue";

function downloadURI(uri, name) {}

export default {
  data() {
    return {
      settingSel: "",
      settingList: [],
      //
      stage: null,
      layer: null,
      hideIm: true,
      timeline_length: 4,
      timeline_options: L.C.timeline_options,
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
      efficentAqs: [], //传递给效率窗口的aqs
      qdEfficents: [], //效率
      //
      conflict: L.C.default_conflict,
      newConflict: "", //传递给冲突窗口的conflict
      conflictDialogVisible: false,
      //
      statisticAqs: [], //传递给统计窗口的aqs
      yardStatisticVisible: false,
      //
      showType: L.C.show_type.circle,
      userId: "",
      qdCwps: []
    };
  },
  methods: {
    saveToPicture() {
      let uri = this.stage.toDataURL({ pixelRatio: 2 });
      let link = document.createElement("a");
      link.download = GB.formatDate(new Date(), "yyyy/MM/dd_hh:mm:ss")+".png";
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    getSettingList(flag) {
      let me = this;
      if (flag) {
        getSettingList({})
          .then(res => {
            let { flag, data, errMsg } = res;
            if (flag) {
              me.settingList = data.map(item => {
                return {
                  label: item,
                  value: item
                };
              });
            } else {
              me.$message.error(errMsg);
            }
          })
          .catch(err => {
            me.$message.error(err);
          });
      }
    },
    getSetting() {
      let me = this;
      if (GB.isEmpty(me.settingSel)) {
        me.$message.warning("请先选择要使用的设置参数");
        return;
      }
      getSetting({
        userId: me.settingSel
      })
        .then(res => {
          let { flag, data, errMsg } = res;
          if (flag) {
            //1.同步冲突
            me.conflict = data.conflict;
            localStorage.setItem("conflict", JSON.stringify(me.conflict));
            //2.同步效率
            me.qdEfficents = data.efficents;
            localStorage.setItem("efficents", JSON.stringify(me.qdEfficents));
            //3.同步延后
            me.delay = data.delay;
            sessionStorage.setItem("delay", JSON.stringify(me.delay));
            //4.同步忽略
            me.voyNoSel = new Set();
            if (data.voyNoSel) {
              if (data.voyNoSel.length > 0) {
                me.voyNoSel = new Set(JSON.parse(data.voyNoSel));
              }
            }
            sessionStorage.setItem(
              "voyNoSel",
              JSON.stringify([...me.voyNoSel.values()])
            );
            //刷新数据，从数据库从新载入
            me.init();
            Promise.all([me.loadQds(), me.loadLywActiveQueues()])
              .then(res => {
                //5.同步PendingCwp
                if (data.qdCwps) {
                  me.qdCwps = data.qdCwps;
                  sessionStorage.setItem("qdCwps", JSON.stringify(me.qdCwps));
                  me.addQdPendingCwps();
                } else {
                  me.mainfun();
                }
                me.$message.success("使用" + me.settingSel + "的设置刷新完毕");
              })
              .catch(err => {
                me.$message.error(err);
              });
          } else {
            me.$message.error(errMsg);
          }
        })
        .catch(err => {
          me.$message.error(err);
        });
    },
    saveSetting() {
      let me = this;
      let lywSetting = {
        conflict: me.conflict,
        efficents: me.qdEfficents,
        delay: me.delay,
        voyNoSel: me.voyNoSel,
        qdCwps: me.qdCwps
      };
      let params = {
        userId: me.userId,
        setting: JSON.stringify(lywSetting)
      };
      addSetting(params)
        .then(res => {
          let { flag, data, errMsg } = res;
          if (flag) {
            me.$message.success("上传设置成功");
          } else {
            me.$message.error(errMsg);
          }
        })
        .catch(err => {
          me.$message.error(err);
        });
    },
    getEfficent(cntr) {
      let me = this;
      //1.找到效率设置
      let qdno = cntr.jbst == "PD" ? cntr.actualQd : cntr.qdno;
      let qd = me.qdEfficents.find(item => item.qdno == qdno);
      let mov = 0;
      if (qd) {
        //找船效率
        let v = qd.vessels.find(item => item.vessel == cntr.vscd);
        if (v) {
          let v_efficent = cntr.vsdr == "E" ? v.exEfficent : v.imEfficent;
          if (v_efficent > 0) {
            mov = v_efficent;
          }
        }
        //找桥吊效率
        if (mov == 0) {
          let qd_default = cntr.vsdr == "E" ? qd.exDefault : qd.imDefault;
          if (qd_default > 0) {
            mov = qd_default;
          }
        }
        //找不到效率
        if (mov == 0) {
          me.$message({
            message:
              qdno + "/" + cntr.vscd + "的效率设置未找到，请先设置效率。",
            type: "error",
            duration: 8000
          });
          return -1;
        }
      } else {
        me.$message({
          message: qdno + "的效率设置未找到，请先设置效率。",
          type: "error",
          duration: 8000
        });
        return -1;
      }
      //2.按照效率计算作业时间
      let efficent = 60 / mov;
      if (cntr.twin == "Y") {
        efficent = efficent / 2;
      }
      return efficent;
    },
    conflictChange(conflict) {
      let me = this;
      me.conflictDialogVisible = false;
      if (conflict) {
        me.conflict = conflict;
        me.mainfun();
      }
    },
    efficentChange(qdEfficents) {
      let me = this;
      me.efficentDialogVisible = false;
      if (qdEfficents) {
        me.qdEfficents = qdEfficents;
        me.mainfun();
      }
    },
    showStatistic() {
      let me = this;
      me.statisticAqs = [...me.activeQueues];
      me.yardStatisticVisible = true;
    },
    showConflict() {
      let me = this;
      me.newConflict = { ...me.conflict };
      me.conflictDialogVisible = true;
    },
    showEfficent() {
      let me = this;
      me.efficentAqs = [...me.drawQueues];
      me.efficentDialogVisible = true;
    },
    addQdPendingCwps(qdCwps) {
      let me = this;
      me.qdCwps = JSON.parse(sessionStorage.getItem("qdCwps"));
      //追加前删除所有追加项，否则会重复。
      me.activeQueues.forEach(aq => {
        aq.queue = aq.queue.filter(c => {
          return c.jbst != "PD";
        });
      });
      //开始追加
      if (me.qdCwps) {
        let ps = [];
        me.qdCwps.forEach(qd => {
          if (qd.pendingCwps.length > 0) {
            let p = new Promise((resolve, reject) => {
              getLywPendingCntrs(qd.pendingCwps).then(res => {
                let { flag, data, errMsg } = res;
                if (flag) {
                  //加上actualQd
                  data.forEach(item => (item.actualQd = qd.qdno));
                  let aq = me.activeQueues.find(item => item.qdno == qd.qdno);
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
      } else {
        me.mainfun();
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
      let dq = me.drawQueues.find(item => item.qdno == qd.qdno);
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
      L.drawTimeline(me.layer, me.drawQueues, me.conflict, me.timeline_length);
      let drawIndex = 0;
      me.drawQueues.forEach((dq, index) => {
        if (!(dq.isOnlyIm && me.hideIm)) {
          let qd = {
            qdno: dq.qdno,
            x: L.C.qd_begin_x + (L.C.qd_width + L.C.qd_interval) * drawIndex,
            y: L.C.qd_begin_y
          };
          L.drawQd(me.layer, qd, me.showQdDialog, me.timeline_length);
          let maxNode = (me.timeline_length * 60) / L.C.scale_min + 1;
          let ss = dq.scales;
          ss.forEach(item => {
            if (item.scaleNode <= maxNode) {
              L.drawScale(
                me.stage,
                me.layer,
                qd,
                item,
                me.showType,
                me.showDelayDialog
              );
            }
          });
          drawIndex += 1;
        }
      });
      me.layer.batchDraw();
    },
    //计算激活的装卸时间点，标记忽略，同时计算延时
    calculateTime() {
      let me = this;
      let StopIteration = new Error("StopIteration");
      try {
        me.activeQueues.forEach(aq => {
          let preTime = new Date(); //上一个箱的时间点
          aq.queue.forEach(cntr => {
            cntr.isConflict = false;
            cntr.isVesselLast = false;
            cntr.conflict = [];
            let voyKey = cntr.vscd + "/" + cntr.vsvy + "-" + cntr.vsdr;
            //标记忽略
            cntr.isIgnore =
              me.voyNoSel.has(voyKey) || cntr.vsdr == "I" || cntr.jbst == "L1";
            //计算延时
            cntr.isDelay = false;
            let eff = me.getEfficent(cntr);
            if (eff < 0) {
              throw StopIteration;
            }
            cntr.opDate = new Date(
              preTime.setSeconds(preTime.getSeconds() + eff * 60)
            );
            //如有设置延时，设置延时必须大于计算延时，否则该设置延时无效。
            let dt = me.delay[cntr.key];
            if (dt) {
              if (new Date(dt) > preTime) {
                cntr.isDelay = true;
                cntr.opDate = new Date(dt);
                preTime = new Date(dt);
              }
            }
          });
        });
      } catch (e) {
        if (e !== StopIteration) {
          throw e;
        } else {
          return;
        }
      }
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
    //激活队列计算冲突，转为可绘制队列
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
                  me.conflict.conflict_min / 2 && !cntr.isIgnore
              );
            });
            calCntrs = calCntrs.concat(cs);
          });
          //2.2计算冲突
          calCntrs.forEach(cntr => {
            let conflict = calCntrs.filter(c => {
              //单单 (a-b)/2， 单双或双双 (a-b)/2-1
              let bay_interval = Math.abs(cntr.fmrw - c.fmrw) / 2;
              if (cntr.fmrw % 2 == 0 || c.fmrw % 2 == 0) {
                bay_interval -= 1;
              }
              return (
                cntr.qdno != c.qdno &&
                cntr.fmst == c.fmst &&
                bay_interval <= me.conflict.conflict_bay_num
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
        //5.统计桥吊下船
        newItem.vessels = [];
        item.queue.forEach(cntr => {
          if (newItem.vessels.indexOf(cntr.vscd) < 0) {
            newItem.vessels.push(cntr.vscd);
          }
        });
        //6.桥吊下队列属性
        item.queue.forEach(cntr => {
          if (cntr.vsdr == "E") {
            newItem.isOnlyIm = false;
          }
        });
        //7.保存到可绘制
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
              //me.mainfun();
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
    //0.用户
    let userinfo = JSON.parse(sessionStorage.getItem("userinfo"));
    if (userinfo) {
      me.userId = userinfo.userid;
    }
    //1.保存的冲突
    let conflict = JSON.parse(localStorage.getItem("conflict"));
    if (conflict) {
      me.conflict = conflict;
    }
    //2.保存的效率
    let efficents = JSON.parse(localStorage.getItem("efficents"));
    if (efficents) {
      me.qdEfficents = efficents;
    }
    //3.保存的延后时间
    let delay = sessionStorage.getItem("delay");
    if (delay) {
      me.delay = JSON.parse(delay);
    }
    //4.保存的忽略航次
    let voyNoSel = sessionStorage.getItem("voyNoSel");
    me.voyNoSel = new Set();
    if (voyNoSel) {
      if (voyNoSel.length > 0) {
        me.voyNoSel = new Set(JSON.parse(voyNoSel));
      }
    }
    //5.保存的CWP
    let qdCwps = sessionStorage.getItem("qdCwps");
    if (qdCwps) {
      me.qdCwps = JSON.parse(qdCwps);
    }
    //6.读数据
    me.init();
    Promise.all([me.loadQds(), me.loadLywActiveQueues()])
      .then(res => {
        me.addQdPendingCwps();
      })
      .catch(err => {
        console.info(err);
      });
  },
  components: {
    AddCwp,
    Efficent,
    Conflict,
    YardStatistic
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