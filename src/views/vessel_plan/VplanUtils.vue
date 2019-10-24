<script>
import GB from "@/global.vue";

var Constant = (function() {
  // Private static attributes.
  var constants = {
    CANVASWIDTH: 1600,
    CANVASHEIGHT: 800,
    // 横线起点
    MTBG: 100,
    // 横线终点
    MTED: 1600,
    // 竖线起点
    YBG: 50,
    // 竖线终点
    YED: 50 + (56 * 60) / 5,
    // 竖线长度
    YLEN: (56 * 60) / 5,

    // 横线实际起点
    XSJBG: 0,
    // 竖线每像素代表分钟
    MINPERPOINT: 5,

    // 当前日期
    PAGEBGDATE: 0,
    PAGEBGTIME: 800
  };
  var Test = {};
  // 设置页面日期
  Test.setPageDate = function(pageDate) {
    constants["PAGEBGDATE"] = pageDate;
  };
  // 获得常量
  Test.getCV = function(name) {
    return constants[name];
  };
  // 按照时间转为Y刻度
  Test.convertY = function(date, time) {
    // 原始刻度
    var y =
      GB.vesselMin(
        Constant.getCV("PAGEBGDATE"),
        Constant.getCV("PAGEBGTIME"),
        date,
        time
      ) / Constant.getCV("MINPERPOINT");
    y = Constant.getCV("YLEN") - y + Constant.getCV("YBG");
    return y;
  };
  // 按照开始,结束时间转换成Y高度
  Test.convertWidth = function(bgDate, bgTime, edDate, edTime) {
    return (
      GB.vesselMin(bgDate, bgTime, edDate, edTime) /
      Constant.getCV("MINPERPOINT")
    );
  };
  return Test;
})();

// 1.画日期坐标
function paintY(layer) {
  // 竖线
  layer.add(
    new Konva.Line({
      points: [
        Constant.getCV("MTBG"),
        Constant.getCV("YBG"),
        Constant.getCV("MTBG"),
        Constant.getCV("YED")
      ],
      stroke: "#008000",
      strokeWidth: 3,
      lineCap: "round",
      lineJoin: "round"
    })
  );
  let n = 0;
  for (let i = 0; i <= Constant.getCV("YLEN"); i = i + 12) {
    // 竖线刻度
    layer.add(
      new Konva.Line({
        points: [
          Constant.getCV("MTBG"),
          i + Constant.getCV("YBG"),
          Constant.getCV("MTBG") - 10,
          i + Constant.getCV("YBG")
        ],
        stroke: "#008000",
        strokeWidth: 1,
        lineCap: "round",
        lineJoin: "round"
      })
    );
    // 竖线坐标
    if (n++ % 8 == 0) {
      var date = GB.addHour(
        GB.convertNumToDate(
          Constant.getCV("PAGEBGDATE"),
          Constant.getCV("PAGEBGTIME")
        ),
        56 - n + 1
      );
      layer.add(
        new Konva.Text({
          x: Constant.getCV("MTBG") - 70,
          y: i + Constant.getCV("YBG") - 5,
          text: date + "0",
          fontSize: 12,
          fontFamily: "Calibri",
          fill: "#000"
        })
      );
    }
  }
}

// 2.画岸线坐标
function paintX(layer) {
  layer.add(
    new Konva.Line({
      points: [
        Constant.getCV("MTBG"),
        Constant.getCV("YED"),
        Constant.getCV("MTED"),
        Constant.getCV("YED")
      ],
      stroke: "#008000",
      strokeWidth: 3,
      lineCap: "round",
      lineJoin: "round"
    })
  );
  // 横线刻度
  let n = 1;
  let xsj = Constant.getCV("XSJBG");
  for (let i = Constant.getCV("MTBG"); i < Constant.getCV("MTED"); i = i + 50) {
    if (n++ % 2 == 0) {
      layer.add(
        new Konva.Line({
          points: [i, Constant.getCV("YED"), i, Constant.getCV("YED") + 5],
          stroke: "#008000",
          strokeWidth: 1,
          lineCap: "round",
          lineJoin: "round"
        })
      );
    } else {
      layer.add(
        new Konva.Line({
          points: [i, Constant.getCV("YED"), i, Constant.getCV("YED") + 10],
          stroke: "#008000",
          strokeWidth: 1,
          lineCap: "round",
          lineJoin: "round"
        })
      );
      // 横线坐标
      layer.add(
        new Konva.Text({
          x: i - 12,
          y: Constant.getCV("YED") + 15,
          text: xsj,
          fontSize: 12,
          fontFamily: "Calibri",
          fill: "#000"
        })
      );
      xsj = xsj + 100;
    }
  }
}

//画时间线
function paintTimeline(layer) {
  let group = layer.findOne("#timeline");
  if (group) {
    group.remove();
    group.destroy();
  }
  group = new Konva.Group({
    id : "timeline"
  });
  let curTime = new Date();
  let dt = GB.dateToInt(curTime);
  let tm = GB.pad(curTime.getHours(), 2) + GB.pad(curTime.getMinutes(), 2);
  let timeline_y = Constant.convertY(dt, tm);
  group.add(
    new Konva.Arrow({
      x: Constant.getCV("MTBG") + 1400,
      y: timeline_y,
      points: [0, 0, -(Constant.getCV("MTBG") + 1400), 0],
      pointerLength: 10,
      pointerWidth: 10,
      fill: "green",
      stroke: "green",
      strokeWidth: 1,
      dash: [10, 5],
    })
  );
  let timeStr = GB.formatDate(curTime,"hh:mm:ss");
  group.add(
    new Konva.Text({
      x: 15,
      y: timeline_y - 12,
      text: timeStr,
      fontSize: 12,
      fontFamily: "Calibri",
      fill: "red"
    })
  );
  layer.add(group);
  layer.draw();
}

// 画船
function paintVessel(layer, vessel, showDialog) {
  // 该船的组ID
  let group = new Konva.Group({
    id: vessel.vscd + "-group",
    draggable: true
  });
  layer.add(group);
  // X坐标
  let vessel_x =
    vessel.vsstart - Constant.getCV("XSJBG") + Constant.getCV("MTBG");
  // Y坐标
  let vessel_y = Constant.convertY(vessel.obdt, vessel.obtm);
  // 宽度
  let vessel_width = parseInt(vessel.vslen);
  // 长度
  let vessel_height = Constant.convertWidth(
    vessel.ibdt,
    vessel.ibtm,
    vessel.obdt,
    vessel.obtm
  );
  // 船名偏移
  let vesselNameDx = vessel_width / 2 - 30;
  let vesselNameDy = vessel_height / 2 - 5;
  // 轮廓
  group.add(
    new Konva.Rect({
      x: vessel_x,
      y: vessel_y,
      width: vessel_width,
      height: vessel_height,
      fill: "rgba(255, 255, 0, 0.5)",
      stroke: "blue",
      strokeWidth: 1
    })
  );
  // 船名
  group.add(
    new Konva.Text({
      x: vessel_x + vesselNameDx,
      y: vessel_y + vesselNameDy,
      text: String(vessel.vscn),
      fontSize: 12,
      fontFamily: "Calibri",
      fill: "#000"
    })
  );
  // 船头
  group.add(
    new Konva.Line({
      points: [
        vessel_x + vessel_width / 10,
        vessel_y,
        vessel_x,
        vessel_y + vessel_height / 2,
        vessel_x + vessel_width / 10,
        vessel_y + vessel_height,
        vessel_x + vessel_width / 10,
        vessel_y
      ],
      fill: "rgba(0,255,255,0.5)",
      stroke: "rgba(255, 255, 0, 0.5)",
      strokeWidth: 1,
      closed: true
    })
  );
  // 抵
  group.add(
    new Konva.Text({
      x: vessel_x + vessel_width / 10 + 1,
      y: vessel_y + 2,
      text: "抵:" + GB.convertDHM(vessel.ardate, vessel.artime),
      fontSize: 12,
      fontFamily: "Calibri",
      fill: "#000"
    })
  );
  // 靠
  group.add(
    new Konva.Text({
      x: vessel_x + vessel_width / 10 + 1,
      y: vessel_y + 14,
      text: "靠:" + GB.convertDHM(vessel.ibdt, vessel.ibtm),
      fontSize: 12,
      fontFamily: "Calibri",
      fill: "#000"
    })
  );
  // 离
  group.add(
    new Konva.Text({
      x: vessel_x + vessel_width / 10 + 1,
      y: vessel_y + 26,
      text: "离:" + GB.convertDHM(vessel.obdt, vessel.obtm),
      fontSize: 12,
      fontFamily: "Calibri",
      fill: "#000"
    })
  );
  // 船头
  group.add(
    new Konva.Text({
      x: vessel_x + vessel_width / 10 + 1,
      y: vessel_y + vessel_height - 12,
      text: vessel.vsstart,
      fontSize: 12,
      fontFamily: "Calibri",
      fill: "red"
    })
  );
  // 船尾
  group.add(
    new Konva.Text({
      x: vessel_x + vessel_width * 1 - 25,
      y: vessel_y + vessel_height - 12,
      text: vessel.vsend,
      fontSize: 12,
      fontFamily: "Calibri",
      fill: "red"
    })
  );
  // 添加鼠标移动和单击事件
  group.on("mousemove", function() {
    let rect = group.find("Rect")[0];
    rect.attrs.stroke = "#ff5500";
    rect.attrs.strokeWidth = 3;
    layer.draw();
  });
  group.on("mouseout", function() {
    let rect = group.find("Rect")[0];
    rect.attrs.stroke = "blue";
    rect.attrs.strokeWidth = 1;
    layer.draw();
  });
  group.on("click", function() {
    showDialog(vessel);
  });
}

export default {
  Constant, //常量
  paintY, //竖线坐标
  paintX, //横线坐标
  paintVessel, //画船
  paintTimeline //画时间线
};
</script>
