<script>
import GB from "@/global.vue";
//建立船舶模型的工具类

const MyFontFamily = "CCXYT";
//const MyFontFamily = "MS Sans Serif"

//是否高箱
function isHCntr(ctsz) {
  let re = false;
  if (
    ctsz == "25" ||
    ctsz == "45" ||
    ctsz == "53" ||
    ctsz == "L5" ||
    ctsz == "L8"
  ) {
    re = true;
  }
  return re;
}

//查找贝
function findBay(hatch, fa, dh) {
  let re = null;
  if (hatch.type == "S") {
    if (fa == "F") {
      fa = "FORWARD";
    } else if (fa == "A") {
      fa = "AFTER";
    } else if (fa == "P") {
      fa = "PARENT";
    } else {
      fa = "?";
    }
    hatch.bays.forEach(function(bay) {
      if (bay.dh == dh && bay.bayType.indexOf(fa) >= 0) {
        re = bay;
      }
    });
  } else {
    hatch.bays.forEach(function(bay) {
      if (fa == "P" && bay.bayType.indexOf("CHILD") >= 0) {
        re = null;
      } else if (bay.dh == dh) {
        re = bay;
      }
    });
  }
  return re;
}

//查找舱盖板依附贝(如有多个,取较长的那个)
function findCoverBay(hatch) {
  let re = null;
  let cl = 0;
  hatch.bays.forEach(function(bay) {
    if (bay.dh == "H") {
      if (bay.cl > cl) {
        re = bay;
        cl = bay.cl;
      }
    }
  });
  return re;
}

//与边长匹配的字体大小
function getFonSizeByCell(side) {
  let result = 3;
  if (side >= 5) {
    result = 6;
  }
  if (side >= 9) {
    result = 7;
  }
  if (side >= 11) {
    result = 8;
  }
  if (side >= 13) {
    result = 10;
  }
  return result;
}

//L5左上角黑色半圆
function drawL5(cell) {
  if (!GB.isEmpty(cell.cntr)) {
    if (cell.cntr.ctsz == "L5") {
      let radius = cell.rect.attrs.width / 2;
      let wedge = new Konva.Wedge({
        x: cell.rect.attrs.x, //坐标点是圆心
        y: cell.rect.attrs.y,
        radius: radius, //半径长度
        angle: 90, //扇形角度
        fill: "black",
        stroke: "black",
        strokeWidth: 1,
        rotation: 0 //从第4象限开始旋转
      });
      cell.group.add(wedge);
    }
  }
}

//高箱,左上角半圆
function drawHighCntr(cell) {
  if (!GB.isEmpty(cell.cntr)) {
    if (isHCntr(cell.cntr.ctsz)) {
      let radius = cell.rect.attrs.width / 2;
      let arc = new Konva.Arc({
        x: cell.rect.attrs.x,
        y: cell.rect.attrs.y,
        innerRadius: radius,
        outerRadius: radius,
        angle: 90,
        stroke: "black",
        strokeWidth: 1
      });
      cell.group.add(arc);
    }
  }
}

//画小箱
function drawCntr20(cell) {
  if (!GB.isEmpty(cell.cntr)) {
    if (cell.cntr.ctsz.substr(0, 1) == "2") {
      let s = cell.rect.attrs.width;
      let x = cell.rect.attrs.x;
      let y = cell.rect.attrs.y;
      let poly = new Konva.Line({
        name: "CntrOuterline",
        points: [x + s, y, x, y + s, x + s, y + s, x + s, y],
        fill: cell["color"],
        stroke: "black",
        strokeWidth: 1,
        closed: true
      });
      cell.group.add(poly);
    }
  }
}

//画大箱//老的矩形销毁
function drawCntr40(cell) {
  if (!GB.isEmpty(cell.cntr)) {
    if (cell.cntr.ctsz.substr(0, 1) != "2") {
      let as = cell.rect.attrs;
      let rect = new Konva.Rect({
        name: "CntrOuterline",
        x: as.x,
        y: as.y,
        width: as.width,
        height: as.height,
        fill: cell["color"],
        stroke: "black",
        strokeWidth: 1
      });
      cell.rect.destroy();
      cell["rect"] = rect;
      cell.group.add(rect);
    }
  }
}

//出口空箱,'e'
function drawExEmpty(cell) {
  let h = cell.rect.attrs.width / 2;
  let fz = getFonSizeByCell(2 * h);
  if (!GB.isEmpty(cell.cntr)) {
    if (cell.cntr.infe == "E") {
      let txt = new Konva.Text({
        x: cell.rect.attrs.x + h - 2,
        y: cell.rect.attrs.y + h - 2,
        text: "e",
        fontSize: fz,
        fontFamily: MyFontFamily
      });
      cell.group.add(txt);
    }
  }
}

//危险品箱,斜正方形
function drawHZ(cell) {
  if (!GB.isEmpty(cell.cntr)) {
    if (cell.cntr.inHz) {
      let h = cell.rect.attrs.width / 2;
      let x = cell.rect.attrs.x;
      let y = cell.rect.attrs.y;
      let rect = new Konva.Line({
        points: [
          x + h,
          y,
          x + 2 * h,
          y + h,
          x + h,
          y + 2 * h,
          x,
          y + h,
          x + h,
          y
        ],
        stroke: "black",
        strokeWidth: 1,
        lineCap: "round",
        lineJoin: "round"
      });
      cell.group.add(rect);
    }
  }
}

//冷冻箱,'R'
function drawTH(cell) {
  if (!GB.isEmpty(cell.cntr)) {
    if (cell.cntr.inTh) {
      let h = cell.rect.attrs.width / 2;
      let x = cell.rect.attrs.x;
      let y = cell.rect.attrs.y;
      let fz = getFonSizeByCell(2 * h);
      if (fz < 6) {
        fz = 6;
      }
      let txt = new Konva.Text({
        x: x + h - 2,
        y: y + h - 2,
        text: "R",
        fontSize: fz,
        fontFamily: MyFontFamily
      });
      cell.group.add(txt);
    }
  }
}

//油罐箱
function drawTN(cell) {
  if (!GB.isEmpty(cell.cntr)) {
    if (cell.cntr.ctty.substr(0, 1) == "T") {
      let h = cell.rect.attrs.width / 2;
      let x = cell.rect.attrs.x;
      let y = cell.rect.attrs.y;
      let fz = getFonSizeByCell(2 * h);
      if (fz < 6) {
        fz = 6;
      }
      let txt = new Konva.Text({
        x: x + h - 2,
        y: y + h - 2,
        text: "T",
        fontSize: fz,
        fontFamily: MyFontFamily
      });
      cell.group.add(txt);
    }
  }
}

//计划倒箱,画个圆
function drawPR(cell) {
  if (!GB.isEmpty(cell.cntr)) {
    if (cell.cntr.inRe) {
      let h = cell.rect.attrs.width / 2;
      let x = cell.rect.attrs.x;
      let y = cell.rect.attrs.y;
      let circle = new Konva.Circle({
        x: x + h,
        y: y + h,
        radius: h - 1,
        stroke: "black",
        strokeWidth: 1
      });
      cell.group.add(circle);
    }
  }
}

//超限箱,边上cell小黑角
function drawOG(cell) {
  let side = cell.rect.attrs.width;
  let quarterSide = Math.round(side / 4);
  let halfSide = Math.round(side / 2);
  let left = cell.rect.attrs.x;
  let top = cell.rect.attrs.y;
  let right = left + cell.rect.attrs.width;
  let bottom = top + cell.rect.attrs.height;
  //在OG左侧,右侧画黑尖
  if (cell.isOgLeftNeighbor) {
    let poly = new Konva.Line({
      points: [
        right - 1,
        top + 1,
        right - 1,
        bottom - 1,
        right - quarterSide - 1,
        top + halfSide,
        right - 1,
        top + 1
      ],
      fill: "black",
      stroke: "black",
      strokeWidth: 1,
      closed: true
    });
    cell.group.add(poly);
  }
  //在OG右侧,左侧画黑尖
  if (cell.isOgRightNeighbor) {
    let poly = new Konva.Line({
      points: [
        left,
        top + 1,
        left,
        bottom - 1,
        left + quarterSide,
        top + halfSide,
        left,
        top + 1
      ],
      fill: "black",
      stroke: "black",
      strokeWidth: 1,
      closed: true
    });
    cell.group.add(poly);
  }
  //在OG上方,下方画黑尖
  if (cell.isOgUpNeighbor) {
    let poly = new Konva.Line({
      points: [
        left + 1,
        bottom - 1,
        right - 1,
        bottom - 1,
        left + halfSide - 1,
        bottom - quarterSide,
        left + 1,
        bottom - 1
      ],
      fill: "black",
      stroke: "black",
      strokeWidth: 1,
      closed: true
    });
    cell.group.add(poly);
  }
  //在OG下方,上方画黑尖
  if (cell.isOgDownNeighbor) {
    let poly = new Konva.Line({
      points: [
        left + 1,
        top + 1,
        right - 1,
        top + 1,
        left + halfSide - 1,
        top + quarterSide,
        left + 1,
        top + 1
      ],
      fill: "black",
      stroke: "black",
      strokeWidth: 1,
      closed: true
    });
    cell.group.add(poly);
  }
}

//箱位不对称,左下角黑色半圆
function drawCellNotBlance(cell) {
  if (cell.notBalance) {
    let h = cell.rect.attrs.width / 2;
    let x = cell.rect.attrs.x;
    let y = cell.rect.attrs.y;
    let wedge = new Konva.Wedge({
      x: x, //坐标点是圆心
      y: y + 2 * h,
      radius: h - 1, //半径长度
      angle: 90, //扇形角度
      stroke: "black",
      fill: "black",
      strokeWidth: 1,
      rotation: -90 //从第4象限开始旋转
    });
    cell.group.add(wedge);
  }
}

//被大箱占位
function draw40Holder(cell) {
  if (cell.isPlaceHolder) {
    let s = cell.rect.attrs.width;
    let x = cell.rect.attrs.x;
    let y = cell.rect.attrs.y;
    let l1 = new Konva.Line({
      points: [x + 1, y + 1, x + s - 1, y + s - 1],
      stroke: "black",
      strokeWidth: 1,
      closed: true
    });
    cell.group.add(l1);
    let l2 = new Konva.Line({
      points: [x + s - 1, y + 1, x + 1, y + s - 1],
      stroke: "black",
      strokeWidth: 1,
      closed: true
    });
    cell.group.add(l2);
  }
}

//寻找箱位的伙伴箱位
function findPartnerCell(cell, partnerBay) {
  let re = null;
  if (!GB.isEmpty(partnerBay)) {
    partnerBay.cells.forEach(function(pc) {
      if (pc.clab == cell.clab && pc.elab == cell.elab) {
        re = pc;
      }
    });
  }
  return re;
}

//寻找箱位的伙伴箱子
function findPartnerCntr(cell, partnerBay) {
  let re = null;
  let targetCell = null;
  if (!GB.isEmpty(partnerBay)) {
    partnerBay.cells.forEach(function(pc) {
      if (pc.clab == cell.clab && pc.elab == cell.elab) {
        targetCell = pc;
      }
    });
  }
  if (!GB.isEmpty(targetCell)) {
    re = targetCell.cntr;
  }
  return re;
}

//舱标签
function getHatchLab(hatch, fa) {
  let re = "";
  if (hatch.type == "S" && fa == "F") {
    re = GB.ipad2(hatch.hatchId - 1);
  }
  if (hatch.type == "S" && fa == "PA") {
    re = GB.ipad2(hatch.hatchId + 1) + "(" + GB.ipad2(hatch.hatchId) + ")";
  }
  if (hatch.type == "N") {
    re = GB.ipad2(hatch.hatchId);
  }
  return re;
}

//箱子颜色
function setImportCntrColor(cell, params) {
  let color = "white";
  if (cell.cntr != null) {
    let cntr = cell.cntr;
    //1.按类型显示
    if (params.showType == "TYPE") {
      let ctype = "";
      if (cntr.infe == "E" && !cntr.inTs) {
        ctype = "进空";
      }
      if (cntr.infe == "E" && cntr.inTs) {
        ctype = "中空";
      }
      if (cntr.infe == "F" && !cntr.inTs) {
        ctype = "进重";
      }
      if (cntr.infe == "F" && cntr.inTs) {
        ctype = "中重";
      }
      if (cntr.inRe) {
        ctype = "倒箱";
      }
      params.cntrTypes.forEach(function(type) {
        if (type.label == ctype) {
          color = type.color;
        }
      });
    }
    //2.按CWP桥吊显示
    if (params.showType == "CWP") {
      params.qds.forEach(function(qd) {
        if (qd.qd == cntr.qd) {
          color = qd.color;
        }
      });
    }
    //3.指定CWP时,只显示指定CWP的颜色,其它箱子不显示颜色
    if (params.curCwp != "") {
      let qd = params.curCwp[0];
      let cwp = params.curCwp[1];
      if (!(cntr.qd == qd && cntr.cwp == cwp)) {
        color = "white";
      }
    }
  }
  cell["color"] = color;
}

//设置出口箱颜色
function setExportCntrColor(cell, params) {
  let color = "white";
  if (cell.cntr != null) {
    let cntr = cell.cntr;
    //1.按港口显示
    if (params.showType == "PORT") {
      params.ports.forEach(function(port) {
        if (port.port == cell.cntr.port) {
          color = port.color;
        }
      });
    }
    //2.按CWP桥吊显示
    if (params.showType == "CWP") {
      params.qds.forEach(function(qd) {
        if (qd.qd == cntr.qd) {
          color = qd.color;
        }
      });
    }
    //3.指定CWP时,只显示指定CWP的颜色,其它箱子不显示颜色
    if (params.curCwp != "") {
      let qd = params.curCwp[0];
      let cwp = params.curCwp[1];
      if (!(cntr.qd == qd && cntr.cwp == cwp)) {
        color = "white";
      }
    }
  }
  cell["color"] = color;
}

//绘制贝标签
function drawBayLab(layer, bay, rect, params) {
  let sideSpan = params.sideSpan;
  let side = params.side;
  let midy = params.midy;
  let max_d_el = params.max_d_el;
  let max_h_el = params.max_h_el;
  let fz = getFonSizeByCell(side);
  //纵标签 forEach无法终止循环
  let ylab_x = rect.attrs.x + sideSpan - side;
  let ylab_y = 0;
  for (let i = 0; i <= bay.ylab.length - 1; i++) {
    for (let m = 0; m <= bay.cells.length - 1; m++) {
      if (bay.cells[m].elab == bay.ylab[i]) {
        ylab_y = bay.cells[m].rect.attrs.y + side / 2 - fz / 2;
        //纵标签不能超左边框
        if (ylab_x < rect.attrs.x + 3) {
          ylab_x = rect.attrs.x + 3;
        }
        let lab = new Konva.Text({
          x: ylab_x,
          y: ylab_y,
          text: bay.ylab[i],
          fontSize: fz,
          fontFamily: MyFontFamily,
          fill: "black"
        });
        layer.add(lab);
        break;
      }
    }
  }
  //横标签
  let top = rect.attrs.y;
  let bottom = rect.attrs.y + rect.attrs.height;
  let xlab_y = 0;
  if (bay.dh == "D") {
    xlab_y = top + midy - max_d_el * side - side - 5 - 2;
    if (xlab_y < top + 10) {
      xlab_y = top + 10;
    }
    //上标签不能超贝标签
    if (xlab_y < rect.attrs.y + 13) {
      xlab_y = rect.attrs.y + 13;
    }
  } else {
    xlab_y = top + midy + max_h_el * side + side + 5;
    if (xlab_y > bottom - 10) {
      xlab_y = bottom - 10;
    }
  }
  let xlab_x = 0;
  for (let i = 0; i <= bay.xlab.length - 1; i++) {
    for (let m = 0; m <= bay.cells.length - 1; m++) {
      if (bay.cells[m].clab == bay.xlab[i]) {
        xlab_x = bay.cells[m].rect.attrs.x;
        let lab = new Konva.Text({
          x: xlab_x,
          y: xlab_y,
          text: bay.xlab[i],
          fontSize: fz,
          fontFamily: MyFontFamily,
          fill: "black"
        });
        layer.add(lab);
        break;
      }
    }
  }
}

//舱位小计
function countHatchCntr(hatch) {
  let f_d20 = 0;
  let f_d40 = 0;
  let f_h20 = 0;
  let f_h40 = 0;
  let pa_d20 = 0;
  let pa_d40 = 0;
  let pa_h20 = 0;
  let pa_h40 = 0;
  hatch.bays.forEach(function(bay) {
    bay.cells.forEach(function(cell) {
      if (cell.cntr != null) {
        if (bay.getFA() == "F" && bay.getPC() == "C") {
          if (bay.dh == "D") {
            f_d20 += 1;
          } else {
            f_h20 += 1;
          }
        } else {
          if (bay.getPC() == "C") {
            if (bay.dh == "D") {
              pa_d20 += 1;
            } else {
              pa_h20 += 1;
            }
          } else {
            if (bay.dh == "D") {
              pa_d40 += 1;
            } else {
              pa_h40 += 1;
            }
          }
        }
      }
    });
  });
  return {
    f_d20: f_d20,
    f_d40: f_d40,
    f_h20: f_h20,
    f_h40: f_h40,
    pa_d20: pa_d20,
    pa_d40: pa_d40,
    pa_h20: pa_h20,
    pa_h40: pa_h40
  };
}

//绘制小计
function drawHatchSummary(layer, hatch, params) {
  let hatchw = params.hatchw;
  let max_cl = params.max_cl;
  let side = params.side;
  let midy = params.midy;
  let hatchSummary = params.hatchSummary;
  //
  let r = "";
  let d20 = 0;
  let d40 = 0;
  let h20 = 0;
  let h40 = 0;
  if (params.fa == "F") {
    r = hatch.fRect;
    d20 = hatchSummary.f_d20;
    d40 = hatchSummary.f_d40;
    h20 = hatchSummary.f_h20;
    h40 = hatchSummary.f_h40;
  } else {
    r = hatch.paRect;
    d20 = hatchSummary.pa_d20;
    d40 = hatchSummary.pa_d40;
    h20 = hatchSummary.pa_h20;
    h40 = hatchSummary.pa_h40;
  }
  //
  let labFontSize = 7;
  let maxSpan = Math.round((hatchw - max_cl * side) / 2);
  let xjx = r.attrs.x + r.attrs.width - maxSpan + 5 + 1;
  let xjy = r.attrs.y + midy;
  let line = new Konva.Line({
    points: [xjx, xjy, xjx + 15, xjy],
    stroke: "black",
    strokeWidth: 1
  });
  layer.add(line);
  let upTxt = new Konva.Text({
    x: xjx,
    y: xjy - 8,
    text: d20 + "+" + d40,
    fontSize: labFontSize,
    fontFamily: MyFontFamily
  });
  layer.add(upTxt);
  let downTxt = new Konva.Text({
    x: xjx,
    y: xjy + 1,
    text: h20 + "+" + h40,
    fontSize: labFontSize,
    fontFamily: MyFontFamily
  });
  layer.add(downTxt);
}

//定义超限箱
function setOgNeighborFlag(hatchs) {
  hatchs.forEach(function(hatch) {
    hatch.bays.forEach(function(bay) {
      bay.cells.forEach(function(cell) {
        cell["isOgLeftNeighbor"] = false;
        cell["isOgRightNeighbor"] = false;
        cell["isOgUpNeighbor"] = false;
        cell["isOgDownNeighbor"] = false;
      });
    });
  });
  hatchs.forEach(function(hatch) {
    hatch.bays.forEach(function(bay) {
      bay.cells.forEach(function(cell) {
        if (!GB.isEmpty(cell.cntr)) {
          if (cell.cntr.inOg) {
            //左超
            if (cell.cntr.leftOg != "0") {
              let tmpCell = bay.getCell(cell.cl - 1, cell.el);
              if (!GB.isEmpty(tmpCell)) {
                tmpCell.isOgLeftNeighbor = true;
              }
            }
            //右超
            if (cell.cntr.rightOg != "0") {
              let tmpCell = bay.getCell(cell.cl + 1, cell.el);
              if (!GB.isEmpty(tmpCell)) {
                tmpCell.isOgRightNeighbor = true;
              }
            }
            //上超
            if (cell.cntr.upog != "0") {
              let tmpCell = bay.getCell(cell.cl, cell.el + 1);
              if (!GB.isEmpty(tmpCell)) {
                tmpCell.isOgUpNeighbor = true;
              }
            }
            //前超,后超
            if (cell.cntr.frontOg != "0" || cell.cntr.behindog != "0") {
              let tmpCell = bay.getCell(cell.cl, cell.el - 1);
              if (!GB.isEmpty(tmpCell)) {
                tmpCell.isOgDownNeighbor = true;
              }
            }
          }
        }
      });
    });
  });
}

//给Bay添加附加属性和方法
function initBay(b) {
  //贝标签
  let bstr = GB.ipad2(b.bayId) + b.dh;
  b["blab"] = bstr;
  //父子
  b["getPC"] = function() {
    let re = "";
    if (b.bayType.indexOf("PARENT") >= 0) {
      re = "P";
    } else {
      re = "C";
    }
    return re;
  };
  //前后,非标放在F
  b["getFA"] = function() {
    let re = "";
    if (b.bayType.indexOf("AFTER") >= 0) {
      re = "A";
    } else {
      re = "F";
    }
    return re;
  };
  //寻找指定格子
  b["getCell"] = function(cl, el) {
    let re = null;
    b.cells.forEach(function(cell) {
      if (cell.cl == cl && cell.el == el) {
        let re = cell;
      }
    });
    return re;
  };
}

//得到舱盖板端点位置(在矩形内的相对位置)
function coverPoint(clab, per, hatch) {
  let re = -1;
  let hbay = findCoverBay(hatch);
  if (hbay != null) {
    for (let i = 0; i < hbay.cells.length; i++) {
      if (parseInt(hbay.cells[i].clab) == clab) {
        if (hbay.cells[i].group != null) {
          let r = hbay.cells[i].group.children[0];
          let left = r.attrs.x;
          let width = r.attrs.width;
          re = Math.round(left + (width * per) / 100);
          //减掉外框left
          if (hbay.getFA() == "F") {
            re -= hatch.fRect.attrs.x;
          } else {
            re -= hatch.paRect.attrs.x;
          }
          break;
        }
      }
    }
  }
  return re;
}

//绘制舱盖板
function drawCover(layer, hatch, fa, midy) {
  let covers = hatch.covers;
  if (covers != null) {
    covers.forEach(function(cover) {
      let bg = coverPoint(cover.bgCell, cover.bgPer, hatch);
      let ed = coverPoint(cover.edCell, cover.edPer, hatch);
      let rect = "";
      if (fa == "F") {
        rect = hatch.fRect;
      } else {
        rect = hatch.paRect;
      }
      bg += rect.attrs.x;
      ed += rect.attrs.x;
      rect = new Konva.Rect({
        x: bg,
        y: rect.attrs.y + midy - 1,
        width: ed - bg,
        height: 2,
        stroke: "black",
        strokeWidth: 1
      });
      layer.add(rect);
    });
  }
}

//创建格子矩形
function createCellRect(layer, cell, params) {
  let cleft = params.cleft;
  let ctop = params.ctop;
  let side = params.side;
  let showDialog = params.showDialog;
  let rect = new Konva.Rect({
    x: cleft,
    y: ctop,
    width: side,
    height: side,
    stroke: "black",
    strokeWidth: 1
  });
  cell["rect"] = rect;
  //创建group便于处理事件
  let group = "";
  if (cell.cntr != null) {
    let gid = GB.trim(cell.cntr.cntrid);
    group = new Konva.Group({
      id: gid
    });
  } else {
    group = new Konva.Group();
  }
  group.add(rect);
  cell["group"] = group;
  group.on("mouseup", function() {
    if (cell.cntr != null) {
      showDialog(cell.cntr);
    }
  });
  layer.add(group);
}

//绘制mini进口箱
function drawImportMiniCell(cell, params) {
  setImportCntrColor(cell, params);
  drawCntr20(cell);
  drawCntr40(cell);
  drawL5(cell);
  drawHighCntr(cell);
  drawHZ(cell);
  drawTH(cell);
  drawOG(cell);
  drawTN(cell);
  drawPR(cell);
  drawCellNotBlance(cell);
  draw40Holder(cell);
}

//绘制mini出口箱
function drawExportMiniCell(cell, params) {
  setExportCntrColor(cell, params);
  drawCntr20(cell);
  drawCntr40(cell);
  drawL5(cell);
  drawHighCntr(cell);
  drawHZ(cell);
  drawTH(cell);
  drawOG(cell);
  drawTN(cell);
  drawPR(cell);
  drawCellNotBlance(cell);
  draw40Holder(cell);
  drawExEmpty(cell);
}

export default {
  //常量
  MyFontFamily,
  //方法
  createCellRect, //创建格子矩形
  initBay, //给Bay添加附加属性和方法
  getFonSizeByCell, //根据边长得到字体大小
  getHatchLab, //舱位标签
  findBay, //寻找特定贝
  findPartnerCell, //寻找其它贝同位置格子
  findPartnerCntr, //寻找其它贝同位置箱子
  draw40Holder, //绘制小箱位被大箱占
  drawImportMiniCell, //绘制进口mini图入口
  drawExportMiniCell, //绘制出口mini图入口
  drawBayLab, //绘制贝的横标签,竖标签
  countHatchCntr, //舱位小计
  setOgNeighborFlag, //设置相邻格子超限标记
  drawCover, //绘制舱盖板
  drawHatchSummary, //绘制舱位小计
  //
  setImportCntrColor, //进口箱颜色设置
  setExportCntrColor //出口箱颜色设置
};
</script>
