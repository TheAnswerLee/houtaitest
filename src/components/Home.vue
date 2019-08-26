<template>
  <el-container class="home-container">
    <!-- 头部区 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt />
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出登录</el-button>
    </el-header>
    <!-- 主体区 -->
    <el-container>
      <!-- 左边导航区 -->
      <el-aside :width="isCollapse? '64px' : '200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu width='200px' background-color="#333744" text-color="#fff" 
        active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition="false" router 
        :default-active="activePath">
          <!-- 一级菜单模块 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <template slot="title">
                <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path+''" v-for="subItem in item.children" :key="subItem.id"  @click="saveNavState('/' + subItem.path)" >
                <template slot="title">
                <!-- 图标 -->
              <i class="el-icon-menu"></i>
              <!-- 文本 -->
              <span>{{subItem.authName}}</span>
            </template>
            </el-menu-item>
          </el-submenu>

        </el-menu>
      </el-aside>
      <!-- 右边内容区 -->
      <el-main>
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>>

<script>
export default {
    data(){
        return{
            menulist:[],
            iconsObj:{
                '125':'iconfont icon-users',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao',
            },
            isCollapse: false,
            activePath:''
        }
    },
    //当页面在加载的时候我们就应该立即调用数据
    created(){
        this.getMenuList()
        this.activePath=window.sessionStorage.getItem('activePath')
    },
  methods: {
    //退出登录功能
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    //获取左边导航的数据
    async getMenuList(){
        const { data:res } = await this.$http.get('menus')
        console.log(res);
        if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menulist=res.data
    },
    //完成收缩左侧导航的功能
    toggleCollapse(){
        this.isCollapse=!this.isCollapse
    },
    //保存激活状态
    saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath)
        this.activePath=activePath
    }
  }
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  //左右贴标对齐
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
    .el-menu{
        border: 0px;
    }
}
.el-main {
  background-color: #eaedf1;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}

</style>