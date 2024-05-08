<template>
  <div class="login">
    <el-form class="form" :model="model" :rules="rules" ref="form">
      <h1 class="title">Vue3 Element Admin</h1>
      <el-form-item prop="username">
        <el-input
          class="text"
          v-model="model.username"
          prefix-icon="User"
          clearable
          :placeholder="$t('login.username')"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          class="text"
          v-model="model.password"
          prefix-icon="Lock"
          show-password
          clearable
          :placeholder="$t('login.password')"
        />
      </el-form-item>
      <el-form-item class="btn-group">
        <el-button
          :loading="btnState.login.loading"
          :disabled="btnState.login.disabled"
          type="default"
          class="btn"
          size="large"
          @click="submit('login')"
        >
          {{ btnState.login.txt() }}
        </el-button>
        <el-button
          :loading="btnState.register.loading"
          :disabled="btnState.register.disabled"
          type="primary"
          class="btn"
          size="large"
          @click="submit('register')"
        >
          {{ btnState.register.txt() }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
  <div class="change-lang">
    <change-lang />
  </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApp } from '@/pinia/modules/app';
import { apiUserRegister, apiUserLogin } from '@/api/user';
import ChangeLang from '@/layout/components/Topbar/ChangeLang.vue';

const { proxy: ctx } = getCurrentInstance(); // 可以把ctx当成vue2中的this
const router = useRouter();
const route = useRoute();

const form = ref(null);
const model = ref({
  username: 'admin',
  password: '123',
});
const rules = ref({
  username: [
    {
      required: true,
      message: ctx.$t('login.rules-username'),
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: ctx.$t('login.rules-password'),
      trigger: 'blur',
    },
  ],
});

const btnState = ref({
  register: {
    disabled: false,
    loading: false,
    txt: () => {
      return btnState.value.register.loading ? ctx.$t('login.registering') : ctx.$t('login.register'); // 和登录共用一个等待中
    },
    cgi: apiUserRegister,
  },
  login: {
    disabled: false,
    loading: false,
    txt: () => {
      return btnState.value.login.loading ? ctx.$t('login.logining') : ctx.$t('login.login');
    },
    cgi: apiUserLogin,
  },
});
const switchBtnState = (type, flag = true) => {
  let { [type]: currBtn, ...anotherBtn } = btnState.value;
  currBtn.disabled = flag;
  anotherBtn.disabled = flag;
  currBtn.loading = flag;
};
const submit = (type) => {
  let currBtn = btnState.value[type];
  switchBtnState(type, true);

  form.value.validate(async (valid) => {
    if (!valid) return;

    currBtn.loading = true;
    const { code, data } = await currBtn.cgi(model.value);
    if (code !== 0) {
      switchBtnState(type, false);
      return;
    }

    ctx.$message.success({
      message: '成功',
      duration: 1000,
    });

    useApp().initToken(data);

    if (!route.query.redirect) {
      return router.push('/');
    }
    // 处理 redirect
    const targetPath = decodeURIComponent(route.query.redirect);
    if (targetPath.startsWith('http')) {
      // 如果是一个url地址，直接导航到新地址
      window.location.href = targetPath;
    } else if (targetPath.startsWith('/')) {
      // 如果是内部路由地址
      router.push(targetPath);
    }
  });
};
</script>

<style lang="scss" scoped>
.login {
  transition: transform 1s;
  transform: scale(1);
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #2d3a4b;
  .form {
    width: 520px;
    max-width: 100%;
    padding: 0 24px;
    box-sizing: border-box;
    margin: 160px auto 0;

    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      background: rgba(0, 0, 0, 0.1);
    }
    :deep(.el-input-group--append > .el-input__wrapper) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    :deep(.el-input-group--prepend > .el-input__wrapper) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    .title {
      color: #fff;
      text-align: center;
      font-size: 24px;
      margin: 0 0 24px;
    }
    .text {
      font-size: 16px;
      :deep(.el-input__inner) {
        color: #fff;
        height: 48px;
        line-height: 48px;
        &::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }
      }
    }

    .btn-group {
      :deep(.el-form-item__content) {
        justify-content: space-between;
      }
    }
    .btn {
      width: 48%;
    }
  }
}
.change-lang {
  position: fixed;
  right: 20px;
  top: 20px;

  :deep(.change-lang) {
    height: 24px;
  }
  :deep(.change-lang:hover) {
    background: none;
  }
  :deep(.change-lang .icon) {
    color: #fff;
  }
}
</style>
