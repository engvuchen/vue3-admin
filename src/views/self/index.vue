<template>
  <div class="self">
    <pro-form ref="proform" :config="formConfig" @cancel="onCancel" @submit="onSubmit"></pro-form>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue';
// import { Delete, Edit } from '@element-plus/icons-vue';
import { apiUserUpd } from '@/api/user';
// import { apiGetResourceList } from '@/api/resource';
// import { apiGetRoleResourceList, apiRoleResourceModify } from '@/api/role_resource';
import { useAccount } from '@/pinia/modules/account';
import tips from '@/utils/tips';
const { proxy } = getCurrentInstance();

const { userinfo } = useAccount(); // {id, username}

// onBeforeMount(async () => {});

// 表格
const table = ref(null);
const refresh = () => {
  table.value.refresh();
};

const proform = ref(null);
const formConfig = ref({
  labelWidth: '90px',
  inputWidth: '200px',
  fields: [
    // username
    {
      component: 'text',
      label: proxy.$t('self.username'),
      name: 'username',
      value: userinfo.username,
      // attributes: {},
      // validity: [
      //   // {
      //   //   required: true,
      //   //   message: 'Name Required',
      //   //   trigger: 'blur',
      //   // },
      // ],
    },
    // password
    {
      component: 'text',
      label: proxy.$t('self.newPassword'),
      name: 'password',
      // attributes: {},
      // validity: [
      //   {
      //     required: true,
      //     message: 'Password Required',
      //     trigger: 'blur',
      //   },
      // ],
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
      // 一般 validity 是 required 这些，但 upload 的 validity 包括 accept, limit，语意应该合在一起，但需要分开
      validity: [],
    },
  ],
});

const onSubmit = async (data) => {
  let postData = {
    ...(data.id ? { id: data.id } : {}),
    name: data.name,
    resource_id: data.resource_id,
  };

  let res = await apiUserUpd(postData);
  if (res.code !== 0) return;

  refresh();
  tips.success('成功');
};
const onCancel = () => {};
</script>

<style lang="scss" scoped>
.self {
  width: 100%;

  //   :deep(.dialog) {
  //     width: fit-content;

  //     .el-textarea__inner {
  //       min-width: 280px;
  //       min-height: 150px !important; // textarea 的调整除了样式，还有配置 style 属性。没有 style，样式的宽度可以溢出
  //     }
  //   }
}
</style>
