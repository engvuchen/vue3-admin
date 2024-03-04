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

<script>
import { defineComponent, getCurrentInstance, reactive, toRefs, ref, watch } from 'vue';
import { apiUserRegister, apiUserLogin } from '@/api/user';
import { useRouter, useRoute } from 'vue-router';
import ChangeLang from '@/layout/components/Topbar/ChangeLang.vue';
import useLang from '@/i18n/useLang';
import { useApp } from '@/pinia/modules/app';

export default defineComponent({
  components: { ChangeLang },
  name: 'login',
  setup() {
    const { proxy: ctx } = getCurrentInstance(); // 可以把ctx当成vue2中的this
    const router = useRouter();
    const route = useRoute();

    const { lang } = useLang();
    watch(lang, () => {
      state.rules = getRules();
    });
    const getRules = () => ({
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
        // {
        //   min: 3,
        //   max: 12,
        //   message: ctx.$t('login.rules-regpassword'),
        //   trigger: 'blur',
        // },
      ],
    });

    const btnState = ref({
      register: {
        disabled: false,
        loading: false,
        cgi: apiUserRegister,
        txt: () => {
          return btnState.value.register.loading ? ctx.$t('login.registering') : ctx.$t('login.register'); // 和登录共用一个等待中
        },
      },
      login: {
        disabled: false,
        loading: false,
        cgi: apiUserLogin,
        txt: () => {
          return btnState.value.login.loading ? ctx.$t('login.logining') : ctx.$t('login.login');
        },
      },
    });
    const switchBtnState = (type, flag = true) => {
      let { [type]: currBtn, ...anotherBtn } = btnState.value;
      currBtn.disabled = flag;
      anotherBtn.disabled = flag;
      currBtn.loading = flag;
    };

    const state = reactive({
      model: {
        username: 'admin',
        password: '123',
      },
      rules: getRules(),
      form: ref(null),
      // submit 不需要定义响应式
      submit: (type) => {
        let { [type]: currBtn } = btnState.value;
        switchBtnState(type, true);

        let { cgi, txt } = currBtn;

        state.form.validate(async (valid) => {
          if (!valid) return;

          currBtn.loading = true;
          const { code, data } = await cgi(state.model);

          if (code !== 0) {
            switchBtnState(type, false);
            return;
          }

          ctx.$message.success({
            message: txt,
            duration: 1000,
          });

          useApp().initToken(data);

          if (!route.query.redirect) {
            return router.push('/');
          }

          // 处理 redirect
          const targetPath = decodeURIComponent(route.query.redirect);
          if (targetPath.startsWith('http')) {
            // 如果是一个url地址
            window.location.href = targetPath;
          } else if (targetPath.startsWith('/')) {
            // 如果是内部路由地址
            router.push(targetPath);
          }
        });
      },
    });

    return {
      ...toRefs(state), // 这个少不了。内层如果还包含了响应式定义，用这个才正常
      btnState,
    };
  },
});
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

    :deep {
      .el-input__wrapper {
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
        background: rgba(0, 0, 0, 0.1);
      }
      .el-input-group--append > .el-input__wrapper {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      .el-input-group--prepend > .el-input__wrapper {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
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
      :deep {
        .el-form-item__content {
          justify-content: space-between;
        }
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
  :deep {
    .change-lang {
      height: 24px;
      &:hover {
        background: none;
      }
      .icon {
        color: #fff;
      }
    }
  }
}
</style>
