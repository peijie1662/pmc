<template>
  <el-row class="container">
    <el-col :span="24" class="header">
      <el-col :span="10" class="logo" :class="isCollapse?'logo-collapse-width':'logo-width'"></el-col>
      <el-col :span="10">
        <div class="tools" @click.prevent="collapse">
          <i class="el-icon-menu" style="font-size:30px;margin-top:15px;">
            <span style="margin-left:10px;font-size:20px;">Production Monitoring Center</span>
            <i class="iconfont icon-icon_crab_line icon" style="font-size:20px;"></i>
          </i>
        </div>
      </el-col>
      <el-col :span="4" class="userinfo">
        <div
          class="headertag"
        >部门:{{userinfo.deptname}} / ID:{{userinfo.userid}} / 用户:{{userinfo.username}}</div>
        <el-dropdown trigger="hover">
          <span class="el-dropdown-link userinfo-inner">
            <img src="../assets/face/man.png">
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>我的消息</el-dropdown-item>
            <el-dropdown-item>设置</el-dropdown-item>
            <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-col>
    <el-col :span="24" class="main">
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical-demo"
        unique-opened
        router
        :collapse="isCollapse"
      >
        <template v-for="(item,index) in $router.options.routes">
          <el-submenu :index="index+''" v-if="(!item.leaf)&&(!item.hidden)" :key="index">
            <template slot="title">
              <i :class="item.iconCls"></i>
              <span slot="title">{{item.name}}</span>
            </template>

            <el-menu-item v-for="child in item.children" :index="child.path" :key="child.path">
              <span slot="title">{{child.name}}</span>
            </el-menu-item>
          </el-submenu>
          <el-menu-item
            v-if="item.leaf&&item.children.length>0&&!item.hidden"
            :index="item.children[0].path"
            :key="index"
          >
            <i :class="item.iconCls"></i>
            <span slot="title">{{item.children[0].name}}</span>
          </el-menu-item>
        </template>
      </el-menu>
      <section class="content-container">
        <div class="grid-content bg-purple-light">
          <el-col :span="24" class="breadcrumb-container">
            <strong class="title">{{$route.name}}</strong>
            <el-breadcrumb separator="/" class="breadcrumb-inner">
              <el-breadcrumb-item v-for="item in $route.matched" :key="item.path">{{ item.name }}</el-breadcrumb-item>
            </el-breadcrumb>
          </el-col>
          <el-col :span="24" class="content-wrapper">
            <transition name="fade" mode="out-in">
              <keep-alive>
                <router-view></router-view>
              </keep-alive>
            </transition>
          </el-col>
        </div>
      </section>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      userinfo: {},
      isCollapse: false
    };
  },
  methods: {
    onSubmit() {
      console.log("submit!");
    },
    handleselect: function(a, b) {},
    //退出登录
    logout: function() {
      var _this = this;
      this.$confirm("确认退出吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          sessionStorage.removeItem("user");
          _this.$router.push("/login");
        })
        .catch(() => {});
    },
    //折叠导航栏
    collapse: function() {
      this.isCollapse = !this.isCollapse;
    },
    showMenu(i, status) {
      this.$refs.menuCollapsed.getElementsByClassName(
        "submenu-hook-" + i
      )[0].style.display = status ? "block" : "none";
    }
  },
  mounted() {
    var userinfo = sessionStorage.getItem("userinfo");
    if (userinfo) {
      this.userinfo = JSON.parse(userinfo);
    }
  }
};
</script>

<style scoped lang="scss">
$color-primary: #20a0ff; //#18c79c

.headertag {
  position: absolute;
  top: 12px;
  right: 120px;
  color: white;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.container {
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 100%;
  .header {
    height: 60px;
    line-height: 60px;
    background: $color-primary;
    color: #fff;
    .userinfo {
      text-align: right;
      padding-right: 35px;
      float: right;
      .userinfo-inner {
        cursor: pointer;
        color: #fff;
        img {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          margin: 10px 0px 10px 10px;
          float: right;
        }
      }
    }
    .logo {
      width: 200px;
      height: 60px;
      font-size: 22px;
      padding-left: 20px;
      padding-right: 20px;
      border-color: rgba(238, 241, 146, 0.3);
      border-right-width: 1px;
      border-right-style: solid;
      img {
        width: 40px;
        float: left;
        margin: 10px 10px 10px 18px;
      }
      .txt {
        color: #fff;
      }
    }
    .logo-width {
      width: 200px;
    }
    .logo-collapse-width {
      width: 64px;
    }
    .tools {
      padding: 0px 23px;
      width: 800px;
      height: 60px;
      line-height: 60px;
      cursor: pointer;
    }
  }
  .main {
    display: flex;
    position: absolute;
    top: 60px;
    bottom: 0px;
    overflow: hidden;
    aside {
      flex: 0 0 200px;
      width: 200px;
      .el-menu {
        height: 100%;
      }
      .collapsed {
        width: 64px;
        .item {
          position: relative;
        }
        .submenu {
          position: absolute;
          top: 0px;
          left: 60px;
          z-index: 99999;
          height: auto;
          display: none;
        }
      }
    }

    .content-container {
      flex: 1;
      overflow-y: scroll;
      padding: 20px;
      .breadcrumb-container {
        .title {
          width: 200px;
          float: left;
          color: #475669;
        }
        .breadcrumb-inner {
          float: right;
        }
      }
      .content-wrapper {
        background-color: #fff;
        box-sizing: border-box;
      }
    }
  }
}
</style>