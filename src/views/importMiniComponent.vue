<template>
  <div>
    <div style="height:50px;background:#f5f7fa;overflow:hidden;">
      <!-- 页面尺寸 -->
      <div class="header-block" style="width:250px;">
        <span style="margin-left:20px;margin-right:20px;">页面设置</span>
        <el-radio-group v-model="pageType" @change="pageSizeChange">
          <el-radio label="A4">A4</el-radio>
          <el-radio label="A3">A3</el-radio>
        </el-radio-group>
      </div>
      <!-- 找箱 -->
      <div class="header-block" style="width:250px;">
        <el-input
          placeholder="请输入箱号"
          size="mini"
          style="margin-left:20px;width:150px;"
          v-model="findingCntr"
        ></el-input>
        <el-button size="mini" style="margin-left:5px;" @click="findCntr">查找</el-button>
      </div>
      <!-- 显示模式 -->
      <div class="header-block" style="width:200px;">
        <el-radio-group
          v-model="showType"
          size="small"
          style="margin-left:20px;"
          @change="showTypeChange"
        >
          <el-radio-button label="TYPE"></el-radio-button>
          <el-radio-button label="CWP"></el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div ref="importMini" style="margin-top:10px;border:1px solid #20a0ff;"></div>
    <el-dialog title="单箱信息" :visible.sync="dialogVisible" width="300px">
      <div>
        <h3>
          <span class="dialogtitle">箱号:</span>
          <span>{{dialogCntr.cntrid}}</span>
        </h3>
        <h3>
          <span class="dialogtitle">箱型:</span>
          <span>{{dialogCntr.ctty}}</span>
          <span class="dialogtitle">尺寸:</span>
          <span>{{dialogCntr.ctsz}}</span>
        </h3>
        <h3>
          <span class="dialogtitle">装货港:</span>
          <span>{{dialogCntr.port}}</span>
          <span class="dialogtitle">箱主:</span>
          <span>{{dialogCntr.lncd}}</span>
        </h3>
        <h3>
          <span class="dialogtitle">空重:</span>
          <span>{{dialogCntr.infe}}</span>
          <span class="dialogtitle">箱重:</span>
          <span>{{dialogCntr.ctgw}}</span>
        </h3>
        <h3>
          <span class="dialogtitle">列:</span>
          <span>{{dialogCntr.clab}}</span>
          <span class="dialogtitle">层:</span>
          <span>{{dialogCntr.elab}}</span>
        </h3>
        <h3>
          <span class="dialogtitle">桥吊:</span>
          <span>{{dialogCntr.qd}}</span>
          <span class="dialogtitle">CWP:</span>
          <span>{{dialogCntr.cwp}}</span>
        </h3>
      </div>
    </el-dialog>
    <!-- 颜色编辑框 -->
    <div class="cwpFloatBar" v-if="isSubWindowShow">
      <div v-for="data in subWindowData" :key="data.label" class="cwpFloatBarCell">
        <el-tag size="mini" style="float:left;margin-top:5px;margin-left:5px;">{{data.label}}</el-tag>
        <el-color-picker
          v-model="data.color"
          size="mini"
          style="float:left;margin-left:10px;"
          @change="colorChange(data.label,data.color)"
        ></el-color-picker>
      </div>
      <div class="cwpFloatBarCell">
        <el-cascader
          expand-trigger="hover"
          :options="cwps"
          v-model="curCwp"
          @change="showTypeChange"
          clearable
          size="mini"
        ></el-cascader>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialogtitle {
  color: #409eff;
  margin-left: 20px;
}
.header-block {
  float: left;
  margin-left: 5px;
  height: 95%;
  width: 300px;
  border: 1px dashed #20a0ff;
  border-radius: 2px;
  line-height: 50px;
}
.cwpFloatBar {
  display: block;
  position: fixed;
  width: 100px;
  right: 50px;
  top: 150px;
  border: 1px solid #409eff;
  background: #f5f7fa;
  box-shadow: rgb(231, 229, 229) 3px 3px 10px 5px;
}
.cwpFloatBarCell {
  width: 100%;
  height: 30px;
  margin-top: 5px;
}
</style>

<script>
import GB from "../global.vue";
import V from "../VesselUtils.vue";

const a4_width = 1200;
const a4_height = 900;
const a3_width = 900 * 2;
const a3_height = 1200;
const ori_side = 5; //原始边长

/*
1.除了常量,不要在此处存放任何值,否则数据会被共享
2.konva的挂载点目前发现只能用ref来指定,否则也会被共享
*/

export default {
  data() {
    return {
      showType: "TYPE", //显示类型
      isSubWindowShow: true,
      subWindowData: [],
      curCwp: [], //选中的CWP
      cntrTypes: [
        {
          label: "进空",
          color: "#FFD772"
        },
        {
          label: "中空",
          color: "#B848FF"
        },
        {
          label: "进重",
          color: "#FF0000"
        },
        {
          label: "中重",
          color: "#3a95ff"
        },
        {
          label: "倒箱",
          color: "#FFFFFF"
        }
      ],
      width: a4_width,
      height: a4_height,
      stage: null, //舞台
      layer: null,
      findingCntr: "",
      dialogVisible: false,
      dialogCntr: "", //提示框显示的箱子
      pageType: "A4",
      liveHatch: 0, //生活舱
      hatchs: [], //舱列表
      qds: [], //桥吊列表
      cwps: [] //CWP列表
    };
  },
  methods: {
    colorChange(label, color) {
      let me = this;
      if (me.showType == "TYPE") {
        me.cntrTypes = me.cntrTypes.map(function(type) {
          if (type.label == label) {
            type.color = color;
          }
          return type;
        });
      }
      if (me.showType == "CWP") {
        me.qds = me.qds.map(function(qd) {
          if (qd.qd == label) {
            qd.color = color;
          }
          return qd;
        });
      }
      me.showTypeChange();
      me = null;
    },
    showTypeChange() {
      let me = this;
      if (me.layer) {
        if (me.showType == "TYPE") {
          me.subWindowData = me.cntrTypes;
        }
        if (me.showType == "CWP") {
          me.subWindowData = me.qds.map(function(qd) {
            return { label: qd.qd, color: qd.color };
          });
        }
        me.hatchs.forEach(function(hatch) {
          hatch.bays.forEach(function(bay) {
            bay.cells.forEach(function(cell) {
              V.setImportCntrColor(cell, {
                showType: me.showType,
                curCwp: me.curCwp,
                qds: me.qds,
                cntrTypes: me.cntrTypes
              });
              if (cell.group) {
                cell.group.children.forEach(function(c) {
                  if (c.attrs.name == "CntrOuterline") {
                    c.attrs.fill = cell["color"];
                  }
                });
              }
            });
          });
        });
        me.layer.draw();
      }
      me = null;
    },
    findCntr(val) {
      let layer = this.layer;
      let id = "#" + this.findingCntr;
      let gp = layer.findOne(id);
      let attrs = gp.children[0].attrs;
      if (!GB.isEmpty(gp)) {
        let x = attrs.x + attrs.width / 2;
        let y = attrs.y + attrs.height / 2;
        let newx = this.width / 2 - x - 200;
        let newy = this.height / 2 - y - 200;
        this.stage.position({
          x: newx,
          y: newy
        });
        this.stage.batchDraw();
        let circle = new Konva.Circle({
          x,
          y,
          radius: 10,
          fill: "red",
          opacity: 0.3,
          stroke: "red",
          strokeWidth: 1
        });
        layer.add(circle);
        layer.draw();
        circle.to({
          offset: {
            x,
            y
          },
          scaleX: 2,
          scaleY: 2,
          fill: "red",
          duration: 0.5,
          onFinish: function() {
            circle.destroy();
          }
        });
      }
    },
    showDialog(cntr) {
      this.dialogVisible = true;
      this.dialogCntr = cntr;
    },
    pageSizeChange() {
      let me = this;
      if (me.pageType == "A4") {
        me.width = a4_width;
        me.height = a4_height;
      } else if (this.pageType == "A3") {
        me.width = a3_width;
        me.height = a3_height;
      }
      me.init();
      me = null;
    },
    rcv(val) {
      this.hatchs = val.hatchs;
      this.qds = val.qds;
      this.cwps = val.cwps;
      this.liveHatch = val.liveHatch;
      val = null;
      this.init();
      this.showTypeChange();
    },
    initStage() {
      this.compeleteDestroy();
      let width = this.width;
      let height = this.height;
      let c = this.$refs.importMini;
      this.stage = new Konva.Stage({
        container: c,
        width,
        height,
        draggable: true
      });
      this.layer = new Konva.Layer();
      this.stage.add(this.layer);
    },
    init() {
      let me = this;
      me.initStage();
      let width = me.width;
      let height = me.height;
      let layer = me.layer;
      let stage = me.stage;
      let max_cl = 0; //最多列
      let max_d_el = 0; //D最大层
      let max_h_el = 0; //H最大层
      let hatchw = 0; //舱宽
      let hatchh = 0; //舱高
      let xp = 0; //x指针
      let yp = 0; //y指针
      //换行-函数
      let nextLineIfNeed = function() {
        if (xp - hatchw < 0) {
          yp = yp + hatchh;
          xp = width;
        }
      };
      //舱位矩形-函数
      let newRect = function() {
        let r = new Konva.Rect({
          x: xp - hatchw,
          y: yp,
          width: hatchw,
          height: hatchh,
          stroke: "black",
          strokeWidth: 1
        });
        return r;
      };
      //1.确定贝参数
      this.hatchs.forEach(function(hatch) {
        hatch.bays.forEach(function(bay) {
          if (bay.cl > max_cl) {
            max_cl = bay.cl;
          }
          if (bay.dh == "H" && bay.el > max_h_el) {
            max_h_el = bay.el;
          }
          if (bay.dh == "D" && bay.el > max_d_el) {
            max_d_el = bay.el;
          }
        });
      });
      //2.不断增加side,寻找最大可用side
      let side = 0;
      for (side = ori_side; side < 100; side++) {
        //舱位大小
        hatchw = max_cl * side + 45;
        hatchh = (max_d_el + max_h_el) * side + 60;
        //指针,从右上角开始
        xp = width;
        yp = 0;
        this.hatchs.forEach(function(hatch) {
          if (hatch.type == "S") {
            //前舱
            nextLineIfNeed();
            xp -= hatchw;
            //后舱
            nextLineIfNeed();
            xp -= hatchw;
          } else {
            //非标舱
            nextLineIfNeed();
            xp -= hatchw;
          }
        });
        //边界判断
        if (yp + hatchh > height) {
          break;
        }
      }
      side -= 1;
      //确定贝标签字体大小
      let labFontSize = V.getFonSizeByCell(side);
      //3.使用合适的side确定舱位矩形
      hatchw = max_cl * side + 45;
      hatchh = (max_d_el + max_h_el) * side + 60;
      //指针,从右上角开始
      xp = width;
      yp = 0;
      this.hatchs.forEach(function(hatch) {
        if (hatch.type == "S") {
          //前舱
          nextLineIfNeed();
          hatch["fRect"] = newRect();
          xp -= hatchw;
          //后舱
          nextLineIfNeed();
          hatch["paRect"] = newRect();
          xp -= hatchw;
        } else {
          //非标舱
          nextLineIfNeed();
          hatch["fRect"] = newRect();
          xp -= hatchw;
        }
      });
      //加入舱位矩形,前后矩形在同一行则画一个矩形就可以了
      this.hatchs.forEach(function(hatch) {
        let hasDraw = false;
        if (!GB.isEmpty(hatch.fRect) && !GB.isEmpty(hatch.paRect)) {
          if (hatch.fRect.attrs.y == hatch.paRect.attrs.y) {
            let rect = new Konva.Rect({
              x: hatch.paRect.attrs.x,
              y: hatch.paRect.attrs.y,
              width: 2 * hatchw,
              height: hatchh,
              stroke: "black",
              strokeWidth: 1
            });
            layer.add(rect);
            hasDraw = true;
          }
        }
        if (!hasDraw) {
          if (!GB.isEmpty(hatch.fRect)) {
            layer.add(hatch.fRect);
          }
          if (!GB.isEmpty(hatch.paRect)) {
            layer.add(hatch.paRect);
          }
        }
      });
      //舱位中间点
      let midx = Math.round(hatchw / 2);
      let midy = Math.round(hatchh * (max_d_el / (max_d_el + max_h_el)));
      //3.绘制舱内
      let drawLiveHatch = false;
      this.hatchs.forEach(function(hatch) {
        //舱位小计
        let hatchSummary = V.countHatchCntr(hatch);
        //1.前舱
        if (!GB.isEmpty(hatch.fRect)) {
          //1.1甲板
          let lab = V.getHatchLab(hatch, "F");
          let hatchLab = new Konva.Text({
            x: hatch.fRect.attrs.x + midx - 5,
            y: hatch.fRect.attrs.y + 2,
            text: lab,
            fontSize: 13,
            fontFamily: V.MyFontFamily,
            fill: "black"
          });
          layer.add(hatchLab);
          let bay = V.findBay(hatch, "F", "D");
          if (bay != null) {
            let partnerBay = V.findBay(hatch, "A", "D");
            let fatherBay = V.findBay(hatch, "P", "D");
            let sideSpan = Math.round((hatchw - bay.cl * side) / 2);
            bay.cells.forEach(function(cell) {
              let cleft = sideSpan + cell.cl * side + hatch.fRect.attrs.x + 5;
              let ctop = midy - (cell.el + 1) * side + hatch.fRect.attrs.y - 5;
              V.createCellRect(layer, cell, {
                cleft,
                ctop,
                side,
                showDialog: me.showDialog
              });
              cell["notBalance"] = GB.isEmpty(
                V.findPartnerCell(cell, partnerBay)
              );
              cell["isPlaceHolder"] =
                !GB.isEmpty(V.findPartnerCntr(cell, fatherBay)) &&
                bay.getPC() == "C";
              V.drawImportMiniCell(cell, {
                showType: me.showType,
                qds: me.qds,
                cntrTypes: me.cntrTypes,
                curCwp: me.curCwp
              });
            });
            V.drawBayLab(layer, bay, hatch.fRect, {
              sideSpan: sideSpan,
              side: side,
              midy: midy,
              max_d_el: max_d_el,
              max_h_el: max_h_el
            });
          }
          //1.2舱内
          bay = V.findBay(hatch, "F", "H");
          if (bay != null) {
            let partnerBay = V.findBay(hatch, "A", "H");
            let fatherBay = V.findBay(hatch, "P", "H");
            let sideSpan = Math.round((hatchw - bay.cl * side) / 2);
            bay.cells.forEach(function(cell) {
              let cleft = sideSpan + cell.cl * side + hatch.fRect.attrs.x + 5;
              let ctop =
                midy +
                bay.el * side -
                (cell.el + 1) * side +
                hatch.fRect.attrs.y +
                5;
              V.createCellRect(layer, cell, {
                cleft,
                ctop,
                side,
                showDialog: me.showDialog
              });
              cell["notBalance"] = GB.isEmpty(
                V.findPartnerCell(cell, partnerBay)
              );
              cell["isPlaceHolder"] =
                !GB.isEmpty(V.findPartnerCntr(cell, fatherBay)) &&
                bay.getPC() == "C";
              V.drawImportMiniCell(cell, {
                showType: me.showType,
                qds: me.qds,
                cntrTypes: me.cntrTypes,
                curCwp: me.curCwp
              });
            });
            V.drawBayLab(layer, bay, hatch.fRect, {
              sideSpan,
              side,
              midy,
              max_d_el,
              max_h_el
            });
          }
          //1.3 小计
          let maxSpan = Math.round((hatchw - max_cl * side) / 2);
          let xjx =
            hatch.fRect.attrs.x + hatch.fRect.attrs.width - maxSpan + 5 + 1;
          let xjy = hatch.fRect.attrs.y + midy;
          let line = new Konva.Line({
            points: [xjx, xjy, xjx + 15, xjy],
            stroke: "black",
            strokeWidth: 1
          });
          layer.add(line);
          if (hatch.type == "S") {
            let upTxt = new Konva.Text({
              x: xjx,
              y: xjy - 8,
              text: hatchSummary.f_d20 + "+" + hatchSummary.f_d40,
              fontSize: labFontSize,
              fontFamily: V.MyFontFamily
            });
            layer.add(upTxt);
            let downTxt = new Konva.Text({
              x: xjx,
              y: xjy + 1,
              text: hatchSummary.f_h20 + "+" + hatchSummary.f_h40,
              fontSize: labFontSize,
              fontFamily: V.MyFontFamily
            });
            layer.add(downTxt);
          } else {
            let upTxt = new Konva.Text({
              x: xjx,
              y: xjy - 10,
              text: hatchSummary.pa_d20 + "+" + hatchSummary.pa_d40,
              fontSize: labFontSize,
              fontFamily: V.MyFontFamily
            });
            layer.add(upTxt);
            let downTxt = new Konva.Text({
              x: xjx,
              y: xjy + 1,
              text: hatchSummary.pa_h20 + "+" + hatchSummary.pa_h40,
              fontSize: labFontSize,
              fontFamily: V.MyFontFamily
            });
            layer.add(downTxt);
          }
          //1.4舱盖板
          //V.drawCover(layer, hatch, "F", midy);
        }
        //2.父后舱
        if (!GB.isEmpty(hatch.paRect)) {
          let lab = V.getHatchLab(hatch, "PA");
          let fz = V.labFontSize;
          let hatchLab = new Konva.Text({
            x: hatch.paRect.attrs.x + midx - 5,
            y: hatch.paRect.attrs.y + 2,
            text: lab,
            fontSize: 13,
            fontFamily: V.MyFontFamily,
            fill: "black"
          });
          layer.add(hatchLab);
          //2.1甲板
          let bay = V.findBay(hatch, "A", "D");
          if (bay != null) {
            let sideSpan = Math.round((hatchw - bay.cl * side) / 2);
            let fatherBay = V.findBay(hatch, "P", "D");
            bay.cells.forEach(function(cell) {
              //因为是后父贝的叠加视图,将父贝的箱注入到子贝,以便画图
              let pcntr = V.findPartnerCntr(cell, fatherBay);
              if (pcntr != null) {
                cell.cntr = pcntr;
              }
              let cleft = sideSpan + cell.cl * side + hatch.paRect.attrs.x + 5;
              let ctop = midy - (cell.el + 1) * side + hatch.paRect.attrs.y - 5;
              V.createCellRect(layer, cell, {
                cleft,
                ctop,
                side,
                showDialog: me.showDialog
              });
              cell["notBalance"] = GB.isEmpty(
                V.findPartnerCell(cell, fatherBay)
              );
              cell["isPlaceHolder"] = false;
              V.drawImportMiniCell(cell, {
                showType: me.showType,
                qds: me.qds,
                cntrTypes: me.cntrTypes,
                curCwp: me.curCwp
              });
            });
            V.drawBayLab(layer, bay, hatch.paRect, {
              sideSpan,
              side,
              midy,
              max_d_el,
              max_h_el
            });
          } else {
            //考虑没有子贝,只有父贝的情况
            bay = V.findBay(hatch, "P", "D");
            if (bay != null) {
              let sideSpan = Math.round((hatchw - bay.cl * side) / 2);
              bay.cells.forEach(function(cell) {
                let cleft =
                  sideSpan + cell.cl * side + hatch.paRect.attrs.x + 5;
                let ctop =
                  midy - (cell.el + 1) * side + hatch.paRect.attrs.y - 5;
                V.createCellRect(layer, cell, {
                  cleft,
                  ctop,
                  side,
                  showDialog: me.showDialog
                });
                cell["notBalance"] = false;
                cell["isPlaceHolder"] = false;
                V.drawImportMiniCell(cell, {
                  showType: me.showType,
                  qds: me.qds,
                  cntrTypes: me.cntrTypes,
                  curCwp: me.curCwp
                });
              });
              V.drawBayLab(layer, bay, hatch.paRect, {
                sideSpan,
                side,
                midy,
                max_d_el,
                max_h_el
              });
            }
          }
          //2.2舱内
          bay = V.findBay(hatch, "A", "H");
          if (bay != null) {
            let sideSpan = Math.round((hatchw - bay.cl * side) / 2);
            let fatherBay = V.findBay(hatch, "P", "H");
            bay.cells.forEach(function(cell) {
              //因为是后父贝的叠加视图,将父贝的箱注入到子贝,以便画图
              let pcntr = V.findPartnerCntr(cell, fatherBay);
              if (pcntr != null) {
                cell.cntr = pcntr;
              }
              let cleft = sideSpan + cell.cl * side + hatch.paRect.attrs.x + 5;
              let ctop =
                midy +
                bay.el * side -
                (cell.el + 1) * side +
                hatch.paRect.attrs.y +
                5;
              V.createCellRect(layer, cell, {
                cleft,
                ctop,
                side,
                showDialog: me.showDialog
              });
              cell["notBalance"] = GB.isEmpty(
                V.findPartnerCell(cell, fatherBay)
              );
              cell["isPlaceHolder"] = false;
              V.drawImportMiniCell(cell, {
                showType: me.showType,
                qds: me.qds,
                cntrTypes: me.cntrTypes,
                curCwp: me.curCwp
              });
            });
            V.drawBayLab(layer, bay, hatch.paRect, {
              sideSpan,
              side,
              midy,
              max_d_el,
              max_h_el
            });
          } else {
            //考虑没有子贝,只有父贝的情况
            let bay = V.findBay(hatch, "P", "H");
            if (bay != null) {
              bay.cells.forEach(function(cell) {
                let sideSpan = Math.round((hatchw - bay.cl * side) / 2);
                let cleft =
                  sideSpan + cell.cl * side + hatch.paRect.attrs.x + 5;
                let ctop =
                  midy +
                  bay.el * side -
                  (cell.el + 1) * side +
                  hatch.paRect.attrs.y +
                  5;
                V.createCellRect(layer, cell, {
                  cleft,
                  ctop,
                  side,
                  showDialog: me.showDialog
                });
                cell["notBalance"] = false;
                cell["isPlaceHolder"] = false;
                V.drawImportMiniCell(cell, {
                  showType: me.showType,
                  qds: me.qds,
                  cntrTypes: me.cntrTypes,
                  curCwp: me.curCwp
                });
              });
              V.drawBayLab(layer, bay, hatch.paRect, {
                sideSpan,
                side,
                midy,
                max_d_el,
                max_h_el
              });
            }
          }
          //2.3小计
          let maxSpan = Math.round((hatchw - max_cl * side) / 2);
          let xjx =
            hatch.paRect.attrs.x + hatch.paRect.attrs.width - maxSpan + 5 + 1;
          let xjy = hatch.paRect.attrs.y + midy;
          let line = new Konva.Line({
            points: [xjx, xjy, xjx + 15, xjy],
            stroke: "black",
            strokeWidth: 1
          });
          layer.add(line);
          let upTxt = new Konva.Text({
            x: xjx,
            y: xjy - 8,
            text: hatchSummary.pa_d20 + "+" + hatchSummary.pa_d40,
            fontSize: labFontSize,
            fontFamily: V.MyFontFamily
          });
          layer.add(upTxt);
          let downTxt = new Konva.Text({
            x: xjx,
            y: xjy + 1,
            text: hatchSummary.pa_h20 + "+" + hatchSummary.pa_h40,
            fontSize: labFontSize,
            fontFamily: V.MyFontFamily
          });
          layer.add(downTxt);
          //2.4舱盖板
          V.drawCover(layer, hatch, "F", midy);
          V.drawCover(layer, hatch, "A", midy);
        }
      });
      //生活舱,后面一个矩形位置
      let hasDrawLive = false;
      for (let i = 0; i <= this.hatchs.length - 1; i++) {
        if (!hasDrawLive && i >= this.liveHatch) {
          let rect = "";
          if (!GB.isEmpty(this.hatchs[i].paRect)) {
            rect = this.hatchs[i].paRect;
          } else {
            rect = this.hatchs[i].fRect;
          }
          let live_left = rect.attrs.x + 8;
          let live_midy = rect.attrs.y + rect.attrs.height / 2;
          let uArrow = new Konva.Arrow({
            x: live_left,
            y: live_midy,
            points: [0, 0, 0, -rect.attrs.height / 2 + 5],
            pointerLength: 10,
            pointerWidth: 10,
            fill: "black",
            stroke: "black",
            strokeWidth: 1
          });
          let dArrow = new Konva.Arrow({
            x: live_left,
            y: live_midy,
            points: [0, 0, 0, rect.attrs.height / 2 - 5],
            pointerLength: 10,
            pointerWidth: 10,
            fill: "black",
            stroke: "black",
            strokeWidth: 1
          });
          hasDrawLive = true;
          layer.add(uArrow);
          layer.add(dArrow);
        }
      }
      layer.move({
        x: -0.5,
        y: 0.5
      });
      layer.draw();
      me = null;
    },
    compeleteDestroy() {
      this.hatchs.forEach(function(hatch){
        if(hatch.fRect){
          hatch.fRect = null;
        }
        if(hatch.paRect){
          hatch.paRect = null;
        }
        hatch.bays.forEach(function(bay){
          bay.cells.forEach(function(cell){
            if(cell.rect){
              cell.rect = null;
            } 
            cell.group = null;
          })
        });
      });
      if (this.stage != null) {
        let shapes = this.stage.find("Shape");
        shapes.forEach(function(shape) {
          shape.destroy();
        });
        this.layer.destroy();
        this.stage.destroy();
        this.layer = null;
        this.stage = null;
        console.log("importMini release");
      }
    }
  },
  mounted() {
    console.log("imMini mounted");
  },
  deactivated() {
    console.log("imMini deactivated");
  },
  beforeDestroy() {
    this.compeleteDestroy();
    this.findingCntr = null;
    this.dialogCntr = null;
    this.hatchs = null;
    console.log("imMini beforeDestroy");
  },
  destroyed() {
    console.log("imMini destroyed");
  }
};
</script>