import Typography from './Typography.vue';
import TypographyText from './TypographyText.vue';
import TypographyTitle from './TypographyTitle.vue';
import TypographyParagraph from './TypographyParagraph.vue';

// 创建 Typography 组件对象，包含子组件
const TypographyComponent = Typography;

TypographyComponent.Text = TypographyText;
TypographyComponent.Title = TypographyTitle;
TypographyComponent.Paragraph = TypographyParagraph;

export default TypographyComponent;
export { TypographyText, TypographyTitle, TypographyParagraph };
