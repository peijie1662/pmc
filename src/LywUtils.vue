<script>
import GB from "./global.vue";

const C = {
  time_length: 12 * 60, //计算时间长度(时间柱长度)
  timeline_width: 20, //时间柱宽度
  //warn: {
  //  //分级别警告
  //  low: { max_num: 2, color: "#e9c341" },
  //  mid: { max_num: 5, color: "#f2723c" },
  //  high: { color: "red" }
  //},
  timeline_options: [
    {
      value: 2,
      label: "2小时"
    },
    {
      value: 4,
      label: "4小时"
    },
    {
      value: 8,
      label: "8小时"
    },
    {
      value: 12,
      label: "12小时"
    }
  ],
  yard_statistic_options: [
    {
      value: 0.5,
      label: "0.5小时"
    },
    {
      value: 1,
      label: "1小时"
    },
    {
      value: 2,
      label: "2小时"
    }
  ],
  show_type: {
    //分类表示
    circle: "circle",
    cwp_rect: "cwp_rect",
    loc_rect: "loc_rect"
  },
  //
  qd_begin_x: 100,
  qd_begin_y: 50,
  qd_width: 100,
  qd_height: 45,
  qd_interval: 20,
  qd_queue_dx: 20,
  qd_queue_dy: 2,
  //
  cntr_interval: 15,
  //
  stage_width: 2000,
  stage_height: 3000,
  //
  //common_eff: 3, //每个几分钟 //TODO 以后可能是属于桥吊属性
  scale_px: 20, //刻度,即间隔多少像素为1刻度
  scale_min: 5, //刻度值，即每刻度代表多少分钟
  //
  //conflict_bay_num: 4, //贝位差小于等于该值就是冲突，如果贝位是一单一双，需要再减1
  //conflict_min: 6 //统计冲突的时间范围
  default_conflict: {
    conflict_bay_num: 4, //贝位差小于等于该值就是冲突
    conflict_min: 6, //统计冲突的时间范围
    low_num: 2,
    low_color: "#e9c341",
    mid_num: 5,
    mid_color: "#f2723c",
    high_color: "red"
  }
};

function drawQd(layer, qd, showQdDialog, timeline_length) {
  let group = new Konva.Group({
    id: qd.qdno + "-group"
  });
  layer.add(group);
  group
    .add(
      new Konva.Rect({
        x: qd.x,
        y: qd.y,
        width: C.qd_width,
        height: C.qd_height,
        fill: "white",
        stroke: "#20a0ff",
        strokeWidth: 1
      })
    )
    .add(
      new Konva.Text({
        x: qd.x + 5,
        y: qd.y + 5,
        text: String(qd.qdno),
        fontSize: 14,
        fontFamily: "Calibri",
        fill: "#000"
      })
    );
  let x1 = qd.x + C.qd_queue_dx;
  let y1 = qd.y + C.qd_height + C.qd_queue_dy;
  let x2 = x1;
  let y2 = y1 + ((timeline_length * 60) / C.scale_min + 1) * C.scale_px;
  group
    .add(
      new Konva.Line({
        points: [x1, y1, x2, y2],
        stroke: "black",
        strokeWidth: 1
      })
    )
    .on("click", () => showQdDialog(qd));
}

//提示信息框
function cntrInfo(stage, layer, x, y, cntr, visible) {
  let gp = stage.find("#cntr_info_dialog")[0];
  if (gp) {
    gp.destroy();
  }
  gp = new Konva.Group({ id: "cntr_info_dialog" });
  let left = x + 50;
  let top = y - 50;
  gp.add(
    new Konva.Rect({
      x: left,
      y: top,
      width: 300,
      height: 150,
      fill: "white",
      stroke: "#20a0ff",
      strokeWidth: 1
    })
  )
    .add(
      new Konva.Text({
        x: left + 5,
        y: top + 5,
        text: "船名航次 --- " + cntr.vscd + "/" + cntr.vsvy + "-" + cntr.vsdr,
        fontSize: 12,
        fontFamily: "Calibri",
        fill: "#000"
      })
    )
    .add(
      new Konva.Text({
        x: left + 5,
        y: top + 25,
        text:
          "桥吊/CWP/SEQ --- " + cntr.qdno + "/" + cntr.cwpn + "/" + cntr.cwps,
        fontSize: 12,
        fontFamily: "Calibri",
        fill: "#000"
      })
    )
    .add(
      new Konva.Text({
        x: left + 5,
        y: top + 45,
        text: "箱号 --- " + cntr.cntrId,
        fontSize: 12,
        fontFamily: "Calibri",
        fill: "#000"
      })
    )
    .add(
      new Konva.Text({
        x: left + 5,
        y: top + 65,
        text:
          "场地位置 --- " +
          cntr.fmst +
          "/" +
          cntr.fmrw +
          "/" +
          cntr.fmln +
          "/" +
          cntr.fmel,
        fontSize: 12,
        fontFamily: "Calibri",
        fill: "#000"
      })
    )
    .add(
      new Konva.Text({
        x: left + 5,
        y: top + 85,
        text: "预计时间: " + GB.formatDate(cntr.opDate, "yyyy/MM/dd hh:mm:ss"),
        fontSize: 12,
        fontFamily: "Calibri",
        fill: "#000"
      })
    );
  let dy = 105;
  if (cntr.isConflict) {
    cntr.conflict.forEach(c => {
      gp.add(
        new Konva.Text({
          x: left + 5,
          y: top + dy,
          text:
            "冲突: " +
            c.qdno +
            "/" +
            c.cwpn +
            "/" +
            c.cwps +
            "  " +
            c.cntrId +
            "  位置：" +
            c.fmst +
            "/" +
            c.fmrw +
            "/" +
            c.fmln +
            "/" +
            c.fmel,
          fontColor: "red",
          fontSize: 12,
          fontFamily: "Calibri",
          fill: "red"
        })
      );
      dy += 20;
    });
  }
  gp.height(dy + 100);
  gp.visible(visible);
  layer.add(gp);
}

function drawScale(stage, layer, qd, scaleItem, type, showDelayDialog) {
  if (scaleItem.cntrs.length > 0) {
    let dx = 0;
    scaleItem.cntrs.forEach((cntr, index) => {
      let group = new Konva.Group({
        id: qd.qdno + scaleItem.scaleNode + cntr.cntrId + "-group"
      });
      layer.add(group);
      let cir_x = qd.x + C.qd_queue_dx + dx;
      let cir_y =
        qd.y + C.qd_height + C.qd_queue_dy + scaleItem.scaleNode * C.scale_px;
      //外框颜色
      let ring_color = "#20a0ff";
      if (cntr.isDelay) {
        ring_color = "#f68a1e";
      }
      //内部颜色
      let content_color = "#20a0ff";
      if (cntr.jbst == "PD") {
        content_color = "yellow";
      }
      if (cntr.isIgnore) {
        content_color = "#dee1e6";
      }
      //冲突颜色
      if (cntr.isConflict) {
        content_color = "red";
      }
      //分类表示-圆圈表示
      if (type == C.show_type.circle) {
        group.add(
          new Konva.Circle({
            id: "no" + index,
            x: cir_x,
            y: cir_y,
            radius: 5,
            fill: content_color,
            stroke: ring_color,
            strokeWidth: 1
          })
        );
        //是同船最后一个
        if (cntr.isVesselLast) {
          group
            .add(
              new Konva.Ring({
                x: cir_x,
                y: cir_y,
                innerRadius: 6,
                outerRadius: 8,
                fill: "#ff5500",
                stroke: "#ff5500",
                strokeWidth: 1
              })
            )
            .add(
              new Konva.Text({
                x: qd.x + 5,
                y: cir_y - 5,
                text: cntr.vscd[0],
                fontSize: 12,
                fontFamily: "Calibri",
                fill: "black"
              })
            );
        }
      } else if (type == C.show_type.cwp_rect) {
        group
          .add(
            new Konva.Rect({
              x: cir_x,
              y: cir_y,
              width: 12,
              height: 10,
              fill: content_color,
              stroke: ring_color,
              strokeWidth: 1
            })
          )
          .add(
            new Konva.Text({
              x: cir_x,
              y: cir_y,
              text: cntr.cwpn,
              fontSize: 10,
              fontFamily: "Calibri",
              fill: "black"
            })
          );
      } else if (type == C.show_type.loc_rect) {
        group
          .add(
            new Konva.Rect({
              x: cir_x,
              y: cir_y,
              width: 12,
              height: 10,
              fill: content_color,
              stroke: ring_color,
              strokeWidth: 1
            })
          )
          .add(
            new Konva.Text({
              x: cir_x,
              y: cir_y,
              text: cntr.fmst,
              fontSize: 10,
              fontFamily: "Calibri",
              fill: "black"
            })
          );
      }
      //添加事件
      group
        .on("mousemove", function() {
          let shape =
            type == C.show_type.circle
              ? group.find("Circle")[0]
              : group.find("Rect")[0];
          shape.attrs.stroke = "#ff2525";
          shape.attrs.strokeWidth = 1;
          cntrInfo(stage, layer, cir_x, cir_y, cntr, true);
          layer.batchDraw();
        })
        .on("mouseout", function() {
          let shape =
            type == C.show_type.circle
              ? group.find("Circle")[0]
              : group.find("Rect")[0];
          shape.attrs.stroke = ring_color;
          shape.attrs.strokeWidth = 1;
          cntrInfo(stage, layer, cir_x, cir_y, cntr, false);
          layer.batchDraw();
        })
        .on("click", () => showDelayDialog(cntr));
      dx += C.cntr_interval;
    });
  }
}

function drawTimeline(layer, drawQueues, conflict, timeline_length) {
  let gp = new Konva.Group({
    id: "left-group"
  });
  layer.add(gp);
  gp.add(
    new Konva.Rect({
      x: 20,
      y: C.qd_begin_y + C.qd_height + C.qd_queue_dy,
      width: C.timeline_width,
      height: ((timeline_length * 60) / C.scale_min + 1) * C.scale_px,
      fill: "white",
      stroke: "#20a0ff",
      strokeWidth: 1
    })
  );
  if (drawQueues) {
    //let maxScale = C.time_length / C.scale_min;
    let maxScale = (timeline_length * 60) / C.scale_min;
    for (let i = 0; i <= maxScale; i++) {
      let conflictNum = 0;
      let conflictTime = null;
      let nodeTime = drawQueues[0].scales[i].scaleTime;
      drawQueues.forEach(dq => {
        dq.scales[i].cntrs.forEach(c => {
          if (c.isConflict) {
            conflictNum += 1;
          }
        });
      });
      //绘制冲突
      let ry =
        C.qd_begin_y + C.qd_height + C.qd_queue_dy + (i + 1) * C.scale_px;
      if (conflictNum > 0) {
        let warn_color = conflict.high_color;
        if (conflictNum <= conflict.low_num) {
          warn_color = conflict.low_color;
        } else if (conflictNum <= conflict.mid_num) {
          warn_color = conflict.mid_color;
        }
        gp.add(
          new Konva.Rect({
            x: 20,
            y: ry,
            width: C.timeline_width,
            height: C.scale_px,
            fill: warn_color,
            stroke: warn_color,
            strokeWidth: 1
          })
        )
          .add(
            new Konva.Line({
              points: [20 + C.timeline_width, ry, C.stage_width, ry],
              stroke: warn_color,
              strokeWidth: 1,
              lineCap: "round",
              lineJoin: "round",
              dash: [5, 5]
            })
          )
          .add(
            new Konva.Text({
              x: 20 + C.timeline_width + 2,
              y: ry + 1,
              //text: GB.formatDate(conflictTime, "hh:mm"),
              text: GB.formatDate(nodeTime, "hh:mm"),
              fontSize: 10,
              fontFamily: "Calibri",
              fill: "black"
            })
          );
      } else {
        //无冲突
        gp.add(
          new Konva.Line({
            points: [20 + C.timeline_width, ry, C.stage_width, ry],
            stroke: "#20a0ff",
            strokeWidth: 1,
            lineCap: "round",
            lineJoin: "round",
            dash: [5, 5]
          })
        ).add(
          new Konva.Text({
            x: 20 + C.timeline_width + 2,
            y: ry + 1,
            text: GB.formatDate(nodeTime, "hh:mm"),
            fontSize: 10,
            fontFamily: "Calibri",
            fill: "black"
          })
        );
      }
    }
  }
}

export default {
  C,
  drawQd,
  drawScale,
  drawTimeline
};
</script>