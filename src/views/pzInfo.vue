<template>
  <div>
    <div>
      <div class="header">
        <el-button
          type="success"
          size="small"
          @click="addTab(editableTabsValue2)"
          class="header-button"
        >新开页面</el-button>
        <el-button
          type="warning"
          size="small"
          @click="closeOther(editableTabsValue2)"
          class="header-button"
        >关闭其它</el-button>
        <el-button type="danger" size="small" @click="closeAll" class="header-button">关闭所有</el-button>
      </div>
      <el-tabs v-model="editableTabsValue2" type="card" closable @tab-remove="removeTab">
        <el-tab-pane
          v-for="item in editableTabs2"
          :key="item.name"
          :label="item.title"
          :name="item.name"
        >
          <vessel @chgTitle="chgTabTitle"></vessel>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.header {
  height: 50px;
  overflow: hidden;
  background: #f5f7fa;
  padding-right: 50px;
}
.header-button {
  float: right;
  margin-top: 5px;
  margin-left: 5px;
}
</style>

<script>
import Vessel from "./vessel.vue";

export default {
  data() {
    return {
      editableTabsValue2: "0",
      editableTabs2: [],
      tabIndex: 0
    };
  },
  methods: {
    chgTabTitle(param) {
      let me = this;
      me.editableTabs2.forEach(function(tab) {
        if (tab.name == me.editableTabsValue2) {
          tab.title = param.vscd + " - " + param.imvsvy + " / " + param.exvsvy;
        }
      });
    },
    closeAll() {
      this.editableTabs2 = [];
    },
    closeOther(val) {
      let me = this;
      let myTab = "";
      me.editableTabs2.forEach(function(tab) {
        if (tab.name == val) {
          myTab = tab;
        }
      });
      this.editableTabs2 = [myTab];
    },
    addTab(targetName) {
      let newTabName = ++this.tabIndex + "";
      this.editableTabs2.push({
        title: "未指定船名航次",
        name: newTabName
      });
      this.editableTabsValue2 = newTabName;
    },
    removeTab(targetName) {
      let me = this;
      let tabs = this.editableTabs2;
      let activeName = this.editableTabsValue2;
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }
      this.editableTabsValue2 = activeName;
      this.editableTabs2 = tabs.filter(tab => tab.name !== targetName);
    }
  },
  components: {
    Vessel
  }
};
</script>
