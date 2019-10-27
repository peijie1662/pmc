<template>
  <div>
    <div class="section">
      <!-- 时间长度下拉框 -->
      <span>统计时间长度：</span>
      <el-select
        v-model="timeline_length"
        size="mini"
        @change="newStatistic"
        style="width:100px;margin-left:10px;"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </div>
    <div class="section" style="margin-top:10px;">
      <div v-for="(item,index) in group" :key="index" class="yard" @click="selYard(item)">
        <b>{{item.yard}}</b>
        ({{item.count}})
      </div>
    </div>
    <div class="section" style="margin-top:10px;">
      <div v-for="(bayGp,index) in selYardGp.cntrs" :key="index" class="bay">
        <b>{{selYardGp.yard}} - {{bayGp.bay}}</b>
        ({{bayGp.cntrs.length}})
        <div v-for="(cntr,index) in bayGp.cntrs" :key="index" style="overflow:hidden;">
          <span style="float:left;margin-left:5px;">{{cntr.cntrId}}</span>
          <span style="float:right;margin-right:5px;">{{cntr.formatDt}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GB from "@/global.vue";
import L from "./LywUtils.vue";

export default {
  data() {
    return {
      timeline_length: 0.5,
      options: L.C.yard_statistic_options,
      group: [],
      selYardGp: "" //选中场地组
    };
  },
  props: ["aqs"],
  watch: {
    aqs: {
      handler(newValue, oldValue) {
        this.selYardGp = "";
        this.newStatistic();
      },
      immediate: true
    }
  },
  methods: {
    selYard(item) {
      let me = this;
      me.selYardGp = item;
      console.info(item);
    },
    newStatistic() {
      let me = this;
      //1.合并成单个数组
      let singleQueue = [];
      for (let aq of me.aqs) {
        singleQueue = singleQueue.concat(aq.queue);
      }
      //2.时间过滤
      let sd = new Date();
      sd.setMinutes(sd.getMinutes() + me.timeline_length * 60);
      let finQueue = singleQueue.filter(item => {
        return item.opDate <= sd && !item.isIgnore && item.jbst != "L1";
      });
      //3.按场地分组，并排序
      let group = GB.groupBy(finQueue, item => {
        return item.fmst;
      });
      let arr = [];
      group.forEach((v, k) => {
        arr.push({
          yard: k,
          cntrs: v
        });
      });
      arr.sort(GB.compareUp("yard"));
      //4.场地内按贝位分组，并排序
      for (let g of arr) {
        let gc = GB.groupBy(g.cntrs || [], item => {
          return item.fmrw;
        });
        let ac = [];
        gc.forEach((v, k) => {
          ac.push({
            bay: k,
            cntrs: v
          });
        });
        ac.sort(GB.compareUp("bay"));
        g.cntrs = ac;
      }
      //5.贝位内箱子按时间排序，并数量统计
      arr.forEach(gp_yard => {
        let total = 0;
        gp_yard.cntrs.forEach(gp_bay => {
          total += gp_bay.cntrs.length;
          gp_bay.cntrs.sort(GB.compareUp("opDate"));
          gp_bay.cntrs.forEach(cntr => {
            cntr.formatDt = GB.formatDate(cntr.opDate, "hh:mm:ss");
          });
        });
        gp_yard.count = total;
      });
      me.group = arr;
    }
  }
};
</script>

<style scoped>
.section {
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #c0c4cc;
  padding: 10px;
}
.yard {
  width: 100px;
  height: 50px;
  border: 1px solid black;
  float: left;
  margin: 10px;
  text-align: center;
  line-height: 50px;
  cursor: pointer;
}
.yard:hover {
  background: yellow;
  color: blue;
}
.bay {
  width: 200px;
  height: 200px;
  overflow: scroll;
  border: 1px solid black;
  float: left;
  margin: 10px;
}
</style>