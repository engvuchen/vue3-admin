<template>
  <div class="self">
    <pro-form ref="proform" :config="formConfig" @cancel="onCancel" @submit="onSubmit"></pro-form>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue';
// import { useRouter } from 'vue-router';
import { apiUserUpd } from '@/api/user';
import { useAccount } from '@/pinia/modules/account';
import tips from '@/utils/tips';
const { proxy } = getCurrentInstance();
// const router = useRouter(); // script setup 一定需要把 useRouter 放在外层

const { userinfo, getUserInfo } = useAccount(); // {id, username, avatar}
const initFields = (config) => {
  config.fields = [
    // id
    {
      component: 'text',
      name: 'id',
      label: proxy.$t('self.id'),
      value: userinfo.id,
      attributes: {
        hide: true,
      },
    },
    // username
    {
      component: 'text',
      label: proxy.$t('self.username'),
      name: 'username',
      value: userinfo.username,
    },
    // password
    {
      component: 'text',
      label: proxy.$t('self.newPassword'),
      name: 'password',
    },
    // avatar
    {
      component: 'upload',
      label: proxy.$t('self.avatar'),
      name: 'avatar',
      value: userinfo.avatar,
      attributes: {
        help: 'JPG、PNG，小于1MB',
        accept: ['jpg', 'png'],
        size: 1,
      },
      // validity（表单自带校验）一般是 required 这些，但 upload 的 validity 包括 accept, limit，语意应该合在一起，实际需要分开
      validity: [],
    },
  ];
};

const proform = ref(null);
let config = {
  labelWidth: '90px',
  inputWidth: '200px',
  fields: [],
};
initFields(config);
const formConfig = ref(config);

const onSubmit = async (data) => {
  let { username, password, avatar } = data;
  let postData = {
    ...(data.id ? { id: data.id } : {}),
    username,
    password,
    avatar,
  };

  let res = await apiUserUpd(postData);
  if (res.code !== 0) return;
  tips.success('成功');

  // 修改个人信息，刷新显示
  // if (password) return router.push('/login');
  if (username || avatar) getUserInfo(true);
};
const onCancel = () => {
  initFields(formConfig);
};
</script>

<style lang="scss" scoped>
.self {
  width: 100%;
}
</style>
