import {
  ChevronRight,
  Code2,
  Home,
  SendHorizontal,
  type LucideIcon,
} from 'lucide-react-native';
import { type StyleProp, type TextStyle } from 'react-native';

type IconSymbolName = keyof typeof ICONS;

const ICONS = {
  'house.fill': Home,
  'paperplane.fill': SendHorizontal,
  'chevron.left.forwardslash.chevron.right': Code2,
  'chevron.right': ChevronRight,
} as const;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
}) {
  const Icon: LucideIcon = ICONS[name];
  const strokeWidth = weight === 'bold' ? 2.5 : weight === 'light' ? 1.6 : 2.1;
  return <Icon color={color} size={size} style={style} strokeWidth={strokeWidth} />;
}
