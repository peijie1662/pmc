<script>
import GB from "./global.vue";

const C = {
  time_length: 12 * 60, //计算时间长度
  //
  qd_begin_x: 100,
  qd_begin_y: 50,
  qd_width: 100,
  qd_height: 50,
  qd_interval: 20,
  qd_queue_dx: 20,
  qd_queue_dy: 2,
  //
  cntr_interval: 15,
  //
  stage_width: 2000,
  stage_height: 3000,
  //
  common_eff: 3, //每个几分钟 //TODO 以后可能是属于桥吊属性
  scale_px: 20, //刻度,即间隔多少像素为1刻度
  scale_min: 5, //刻度值，即每刻度代表多少分钟
  //
  conflict_bay_num: 4, //贝位差小于等于该值就是冲突，如果贝位是一单一双，需要再减1
  conflict_min: 6 //统计冲突的时间范围
};

function drawQd(layer, qd, showQdDialog) {
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
        stroke: "blue",
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
  let y2 = 3000;
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
      stroke: "blue",
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

function drawScale(stage, layer, qd, scaleItem, showDelayDialog) {
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
      //延后颜色
      let ring_color = "blue";
      if (cntr.isDelay) {
        ring_color = "#f68a1e";
      }
      //忽略颜色
      let content_color = "#20a0ff";
      if (cntr.isIgnore) {
        content_color = "#dee1e6";
      }
      //冲突颜色
      if (cntr.isConflict) {
        content_color = "red";
      }
      group
        .add(
          new Konva.Circle({
            id: "no" + index,
            x: cir_x,
            y: cir_y,
            radius: 5,
            fill: content_color,
            stroke: ring_color,
            strokeWidth: 2
          })
        )
        .on("mousemove", function() {
          let circle = group.find("Circle")[0];
          circle.attrs.stroke = "#ff2525";
          circle.attrs.strokeWidth = 2;
          cntrInfo(stage, layer, cir_x, cir_y, cntr, true);
          layer.draw();
        })
        .on("mouseout", function() {
          let circle = group.find("Circle")[0];
          circle.attrs.stroke = ring_color;
          circle.attrs.strokeWidth = 2;
          cntrInfo(stage, layer, cir_x, cir_y, cntr, false);
          layer.draw();
        })
        .on("click", () => showDelayDialog(cntr));
      dx += C.cntr_interval;
    });
  }
}

function drawTimeline(layer, drawQueues) {
  let gp = new Konva.Group({
    id: "left-group"
  });
  layer.add(gp);
  gp.add(
    new Konva.Rect({
      x: 20,
      y: C.qd_begin_y + C.qd_height + C.qd_queue_dy,
      width: 50,
      height: C.stage_height,
      fill: "white",
      stroke: "blue",
      strokeWidth: 1
    })
  );
  if (drawQueues) {
    let maxScale = C.time_length / C.scale_min;
    for (let i = 0; i <= maxScale; i++) {
      let conflictNum = 0;
      drawQueues.forEach(dq => {
        dq.scales[i].cntrs.forEach(c => {
          if (c.isConflict) {
            conflictNum += 1;
          }
        });
      });
      //绘制冲突
      if (conflictNum > 0) {
        gp.add(
          new Konva.Rect({
            x: 20,
            y: C.qd_begin_y + C.qd_height + C.qd_queue_dy + i*C.scale_px,
            width: 50,
            height: C.scale_px,
            fill: "red",
            stroke: "red",
            strokeWidth: 1
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
