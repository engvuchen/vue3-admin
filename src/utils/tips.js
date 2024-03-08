import { ElMessage } from 'element-plus';

const tips = {};
Object.keys(ElMessage).forEach((key) => {
  tips[key] = ElMessage[key];
});

export default tips;
