<template>
  <div>
    <div style="position:relative;">
      <el-slider
        v-model="scaleVal"
        show-input
        style="display:inline-block;width:500px;"
        @change="scaleChg"
      ></el-slider>
      <el-button
        size="small"
        type="primary"
        style="position:absolute; top:3px;left:520px;"
        plain
        @click="showHeader = !showHeader"
      >挑选贝</el-button>
      <el-button
        size="small"
        type="primary"
        style="position:absolute; top:3px;left:590px;"
        plain
        @click="selAll"
      >全选</el-button>
      <el-button
        size="small"
        type="primary"
        style="position:absolute; top:3px;left:655px;"
        plain
        @click="cancelAll"
      >取消</el-button>
      <div>
        <el-checkbox-group v-if="showHeader" v-model="baySelList" @change="selBay" size="mini">
          <el-checkbox-button v-for="bay in bayList" :label="bay.blab" :key="bay.blab"></el-checkbox-button>
        </el-checkbox-group>
      </div>
      <div ref="exbay"></div>
    </div>
  </div>
</template>

<script>
import GB from "@/global.vue";

const width = 1200; //舞台宽度
const height = 3000; //舞台高度
const bw = 1100; //贝图宽度
const bh = 900; //贝图高度
const boutleft = 5; //贝图外左边距
const bouttop = 5; //贝图外上边距
const side = 60; //箱位边长

export default {
  data() {
    return {
      scaleVal: 100, //缩放比例
      showHeader: false, //是否显示贝选择列表
      showSetupDialog: false, //是否显示设置对话框
      bayList: [],
      baySelList: [] //选中贝标签列表
    };
  },
  props: ["blist"],
  watch: {
    blist(val) {
      this.bayList = val;
    }
  },
  methods: {
    selAll() {
      this.baySelList = this.bayList.map(function(el) {
        return el.blab;
      });
      this.disBays();
    },
    cancelAll() {
      this.baySelList = [];
      this.disBays();
    },
    selBay() {
      this.disBays();
    },
    scaleChg() {
      this.disBays();
    },
    getBay(blab) {
      let bays = this.bayList.filter(function(el) {
        return el.blab == blab;
      });
      return bays[0];
    },
    disBays() {
      let me = this;
      let c = me.$refs.exbay;
      let stage = new Konva.Stage({
        container: c,
        width: width,
        height: height
      });
      let layer = new Konva.Layer();
      stage.add(layer);
      let offsetx = 0; //贝图 偏移量
      let offsety = 0;
      me.baySelList.forEach(function(blab, index) {
        let bay = me.getBay(blab); //将贝标签转换成贝对象
        let bcl = bay.cl; //贝有几列
        let bel = bay.el; //贝有几层
        let binleft = (bw - side * bcl) / 2; //内X边距
        let bintop = (bh - side * bel) / 2; //内Y边距
        layer.clear();
        //画外框
        let rect = new Konva.Rect({
          x: boutleft + 0.5 + offsetx,
          y: bouttop + 0.5 + offsety,
          width: bw,
          height: bh,
          stroke: "black",
          strokeWidth: 1
        });
        layer.add(rect);
        //画贝标签
        let txt = new Konva.Text({
          x: boutleft + bw / 2 - 30 + offsetx,
          y: bouttop + 5 + offsety,
          text: bay.blab,
          fontSize: 50,
          fontFamily: "Calibri",
          fill: "#569cd6"
        });
        layer.add(txt);
        //画横标签
        let hy = 0; //横标签Y坐标
        if (bay.dh == "D") {
          hy = bouttop + bintop - 50;
        } else {
          hy = bouttop + bintop + side * bel + 50;
        }
        let hx = boutleft + binleft + side / 4; //横标签X开始坐标
        let hArr = bay.xlab;
        hArr.forEach(function(lab) {
          let txt = new Konva.Text({
            x: hx + offsetx,
            y: hy + offsety,
            text: lab,
            fontSize: 30,
            fontFamily: "Calibri",
            fill: "#208395"
          });
          hx += side;
          layer.add(txt);
        });
        //画纵标签
        let zy = bouttop + bintop + side * (bel - 1) + side / 4; //纵标签Y开始坐标
        let zx = boutleft + binleft - 50; //纵标签X坐标
        let zArr = bay.ylab;
        zArr.forEach(function(lab) {
          let txt = new Konva.Text({
            x: zx + offsetx,
            y: zy + offsety,
            text: lab,
            fontSize: 30,
            fontFamily: "Calibri",
            fill: "#208395"
          });
          zy -= side;
          layer.add(txt);
        });
        //画箱位
        let cells = bay.cells;
        cells.forEach(function(c) {
          let cx = boutleft + binleft + side * c.cl; //left
          let cy = bouttop + bintop + (bel - (c.el + 1)) * side; //top
          let rect = new Konva.Rect({
            id: c.cl + "-" + c.el,
            x: cx + 0.5 + offsetx,
            y: cy + 0.5 + offsety,
            width: side,
            height: side,
            stroke: "black",
            strokeWidth: 1
          });
          layer.add(rect);
          //箱信息
          let orix = rect.attrs["x"];
          let oriy = rect.attrs["y"];
          let inx = orix;
          let iny = oriy;
          let fz = 9;
          if (!GB.isEmpty(c.cntr)) {
            //港口
            inx += 1;
            iny += 2;
            let port = new Konva.Text({
              x: inx,
              y: iny,
              text: c.cntr.port,
              fontSize: fz
            });
            layer.add(port);
            //箱号前4位
            iny += 12;
            let ctpf = new Konva.Text({
              x: inx,
              y: iny,
              text: c.cntr.cntrid.substr(0, 4),
              fontSize: fz
            });
            layer.add(ctpf);
            //尺寸
            inx += 30;
            let ctsz = new Konva.Text({
              x: inx,
              y: iny,
              text: c.cntr.ctsz,
              fontSize: fz
            });
            layer.add(ctsz);
            //箱型
            inx += 13;
            let ctty = new Konva.Text({
              x: inx,
              y: iny,
              text: c.cntr.ctty,
              fontSize: fz
            });
            layer.add(ctty);
            //箱号后8位
            inx = orix + 1;
            iny += 12;
            let cntrid = new Konva.Text({
              x: inx,
              y: iny,
              text: c.cntr.cntrid.substr(5, 8),
              fontSize: fz
            });
            layer.add(cntrid);
            //箱主
            iny += 12;
            let lncd = new Konva.Text({
              x: inx,
              y: iny,
              text: c.cntr.lncd,
              fontSize: fz
            });
            layer.add(lncd);
            //毛重
            inx += 40;
            let ctgw = new Konva.Text({
              x: inx,
              y: iny,
              text: (c.cntr.ctgw / 1000).toFixed(1),
              fontSize: fz
            });
            layer.add(ctgw);
            //列层
            inx = orix + 1;
            iny += 12;
            let clel = new Konva.Text({
              x: inx,
              y: iny,
              text: c.cntr.clab + " " + c.cntr.elab,
              fontSize: fz
            });
            layer.add(clel);
          }
        });
        //调整偏移量,先向右平铺,超过宽度换行
        if (me.rv(offsetx + bw + bw) > width) {
          offsetx = 0;
          offsety += bh;
        } else {
          offsetx += bw;
        }
      });
      layer.scale({ x: this.scaleVal / 100, y: this.scaleVal / 100 });
      layer.draw();
      //this.$emit('sizeChgEvent', offsety); //将消息传回父组件
    },
    rv(val) {
      return (val * this.scaleVal) / 100;
    }
  },
  beforeDestroy() {
    let me = this;
    me.bayList = null;
    me.baySelList = null;
    me.$refs.exbay = null;
  }
};
</script>

<style>
</style>

