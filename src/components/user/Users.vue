<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 小卡片 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="10">
                     <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getUserList" @keyup.enter.native="getUserList()">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                     </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表区域 -->
            <el-table :data='userlist' border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <!-- 作用域插槽会覆盖prop属性 -->
                <el-table-column label="状态" >
                <template slot-scope="scope">
                  <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                <template slot-scope="scope">
                <!-- 修改按钮 -->
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                <!-- 删除按钮 -->
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                <!-- 分配角色按钮 -->
                <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
                </el-tooltip>
                </template>
                </el-table-column>
            </el-table>

                <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" 
      :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" 
      layout="total, sizes, prev, pager, next, jumper" :total="total">

      </el-pagination>

        </el-card>
        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 内容的主体区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                  <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户对话框 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
              <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                  <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled=""></el-input>
                  </el-form-item>
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email" ></el-input>
                  </el-form-item>
                  <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile" ></el-input>
                  </el-form-item>
              </el-form>    
              <span slot="footer" class="dialog-footer">
               <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
               </span>
        </el-dialog>

         <!-- 分配权限的对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRoletDialogVisible" width="50%" 
        @close="setRoletDialogClosed">
            <div>
              <p>当前的用户:{{userInfo.username}}</p>
              <p>当前的角色:{{userInfo.role_name}}</p>
              <p>分配新角色:
                   <el-select v-model="selectedRoleId" placeholder="请选择">
                    <el-option
                         v-for="item in rolesList"
                         :key="item.id"
                         :label="item.roleName"
                         :value="item.id">
                       </el-option>
                    </el-select>
              </p>
            </div>
            <span slot="footer" class="dialog-footer">
            <el-button @click="setRoletDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>>

<script>
import { async } from 'q';

export default {
  data() {
    //自定义邮箱验证规则
    let checkEmail = (rule, value, cb) => {
      //验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      //如果校验的值通过了   那么返回
      if (regEmail.test(value)) {
        //合法的邮箱
        return cb();
      }
      cb(new Error("请输入正确的邮箱"));
    };
    // 验证手机号的规则
    let checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

      if (regMobile.test(value)) {
        return cb();
      }

      cb(new Error("请输入合法的手机号"));
    };
    return {
      queryInfo: {
        query: "",
        //当前的页数
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],
      total: 0,
      addDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      //添加表单的验证规则对象
      addFormRules: {
        username: [
          //必填项
          { required: true, message: "请输入用户名", trigger: "blur" },
          //长度的校验规则
          {
            min: 3,
            max: 10,
            message: "用户名的长度在3~10个字符之间",
            trigger: "blur"
          }
        ],
        //密码校验
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "用户名的长度在6~15个字符之间",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      editDialogVisible:false,
      //查询到的用户信息对象
      editForm:{},
      // editFormRules:{
      //   email:[
      //     { required: true, message: "请输入邮箱", trigger: "blur" },
      //     { validator: checkEmail, trigger: "blur" }
      //   ],
      //     mobile: [
      //     { required: true, message: "请输入手机号", trigger: "blur" },
      //     { validator: checkMobile, trigger: "blur" }
      //   ]
      // }
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      setRoletDialogVisible:false,
      userInfo:{},
      //所有角色的数据列表
      rolesList:[],
      //已选中的角色Id值
      selectedRoleId:''

    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    //获取列表数据
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      console.log(res);
      if (res.meta.status !== 200) return this.$message.error("获取数据失败");
      this.userlist = res.data.users;
      this.total = res.data.total;
    },
    //监听pagesize改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    //监听switch开关状态的改变
    async userStateChanged(userinfo) {
      //拿过来的诗句是动态字符串,所以用反引号做拼接
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (!res.meta.status == 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      //  this.$message.success('更新用户状态成功')
    },
    //监听添加用户框关闭事件
    addDialogClosed() {
      //重置表单先找到ref的引用  然后调用resetFields()方法  可以重置表单
      this.$refs.addFormRef.resetFields();
    },
    //点击按钮,添加新的用户
    addUser() {
      //在添加之前要进行表单的预校验,
      this.$refs.addFormRef.validate(async valid => {
        //如果验证失败  直接跳出去  不走添加步骤
        if (!valid) return;
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) {
          this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功！");
        // 隐藏添加用户的对话框
        this.addDialogVisible = false;
        // 重新获取用户列表数据
        this.getUserList();
      });
    },
    //展示编辑用户的对话框
    async showEditDialog(id) {
      console.log(id);
      const {data:res} = await this.$http.get('users/'+id)
      if(res.meta.status!==200){
        return this.$message.error('查询用户失败')
      }
      this.editForm=res.data
      
      this.editDialogVisible=true;
    },
    //修改表单重置操作
    editDialogClose(){
      this.$refs.editFormRef.resetFields()
    },
    //修改用户并提交
    editUserInfo(){
      this.$refs.editFormRef.validate(async valid=>{
        //如果预校验不通过 就直接return出去   只有校验通过 才发起请求
        if(!valid) return
        const {data:res} = await this.$http.put('users/'+this.editForm.id,
        {email:this.editForm.email,mobile:this.editForm.mobile})
        if(res.meta.status!=200){
          return this.$message.error('更新用户信息失败')
        }
        //关闭对话框
        this.editDialogVisible=false;
        //刷新数据列表
        this.getUserList()
        //提示修改成功
        this.$message.success('更新用户信息成功')
      })
    },
    //根据id删除用户信息
    async removeUserById(id){
       const confirmRusult = await this.$confirm(
         '此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        //删除成功返回confirm  如果错误返回cancel
        //console.log(confirmRusult);
        if(confirmRusult!=='confirm'){
          return this.$message.info('取消删除')
        }
       const {data:res}= await this.$http.delete('users/'+id)
        if(res.meta.status!==200){
          return this.$message.error('删除失败') 
        }
        this.$message.success('删除用户成功')
        this.getUserList()
    },
    //展示分配角色的对话框
    async setRole(userInfo){
      this.userInfo=userInfo
      //在展示对话框之前,获取所有的角色列表
      const {data:res} = await this.$http.get('roles')
      if(res.meta.status!==200){
          return this.$message.error('获取角色列表失败') 
        }
        this.rolesList=res.data
      this.setRoletDialogVisible=true
    },
    //点击按钮分配权限
    async saveRoleInfo(){
      //如果没有选择新的角色
      if(!this.selectedRoleId){
        return this.$message.error('请选择要分配的角色!')
      }
      const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
      if(res.meta.status!==200){
        return this.$message.error('更新角色失败!')
      }
      this.$message.success('更新角色成功!')
      this.getUserList()
      this.setRoletDialogVisible=false;
    },
    //监听分配角色对话框的关闭事件
    setRoletDialogClosed(){
      this.selectedRoleId='',
      this.userInfo={}
    }
  }
};
</script>

<style lang="less" scoped>
</style>
