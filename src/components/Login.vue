<template>
    <div class="login_container">
        <div class="box_login">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>

            <!-- 登录区域 -->  
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user" ></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password" @keyup.enter.native="login()"></el-input>
                </el-form-item>
                <!-- 按钮 -->
                <el-form-item class="btns">
                     <el-button type="primary" @click="login">登录</el-button>
                      <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import { log } from 'util';
import { async } from 'q';
export default {
    data(){
        return{
            //这是登录表单数据绑定对象
            loginForm:{
                username:'',
                password:'',
            },
            loginFormRules:{
                //验证用户名是否合法
                username:[
                    { required: true, message: '请输入登录名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                //验证密码是否合法
                password:[
                     { required: true, message: '请输入登录密码', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ]

            }
        }
    },
    methods:{
        resetLoginForm(){
            //resetFields()这是重置表单的方法
            this.$refs.loginFormRef.resetFields()
        },
        //点击登录后的功能
        login(){
            //validate():这个表单验证方法后面接一个回调函数,然后传入一个形参valid
            this.$refs.loginFormRef.validate(async valid =>{
                // console.log(valid);
                if(!valid) return
                const {data:res}= await this.$http.post('login',this.loginForm)
                console.log(res);
                if(res.meta.status !== 200) return this.$message.error('登录失败');
                this.$message.success('登录成功');
                //将登陆之后的token,保存到客户端的sessionStorage
                window.sessionStorage.setItem('token',res.data.token)
                //通过编程方式跳转到后台主页
                this.$router.push('/home')
            })
        }
    }
}
</script>

<style lang="less" scoped>
    .login_container{
        background-color: #2b4b6b;
        height: 100%;
    }
    .box_login{
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 3px;
        position: absolute;
        left: 50%;
        top:50%;
        transform: translate(-50%,-50%);

        .avatar_box{
            height: 130px;
            width: 130px;
            border: 1px solid #eee;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 0 10px #ddd;
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
            background-color: #fff;
            img{
                width: 100%;
                height: 100%;
                 border-radius: 50%;
                 background-color: #eee
            }
        }
    }
    .login_form{
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;


    }
    .btns{
        display: flex;
        justify-content: flex-end;
    }
</style>
