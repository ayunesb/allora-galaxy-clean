
import React from 'react';
import {
  Search,
  Settings,
  User,
  Home,
  LogOut,
  Package,
  Layers,
  ShieldAlert,
  Activity,
  BarChart2,
  Eye,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Bell,
  Calendar,
  FileText,
  MessageCircle,
  Plus,
  Trash,
  Edit,
  MoreVertical,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Menu,
  RefreshCw,
  Upload,
  Download,
  Filter,
  ExternalLink
} from 'lucide-react';

export type IconName =
  | 'search'
  | 'settings'
  | 'user'
  | 'home'
  | 'logout'
  | 'package'
  | 'layers'
  | 'shield'
  | 'activity'
  | 'chart'
  | 'eye'
  | 'users'
  | 'warning'
  | 'success'
  | 'info'
  | 'close'
  | 'bell'
  | 'calendar'
  | 'file'
  | 'message'
  | 'plus'
  | 'trash'
  | 'edit'
  | 'more'
  | 'spinner'
  | 'arrowRight'
  | 'arrowLeft'
  | 'chevronRight'
  | 'chevronLeft'
  | 'chevronDown'
  | 'chevronUp'
  | 'menu'
  | 'refresh'
  | 'upload'
  | 'download'
  | 'filter'
  | 'external';

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

const iconComponents: Record<IconName, React.ElementType> = {
  search: Search,
  settings: Settings,
  user: User,
  home: Home,
  logout: LogOut,
  package: Package,
  layers: Layers,
  shield: ShieldAlert,
  activity: Activity,
  chart: BarChart2,
  eye: Eye,
  users: Users,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
  close: X,
  bell: Bell,
  calendar: Calendar,
  file: FileText,
  message: MessageCircle,
  plus: Plus,
  trash: Trash,
  edit: Edit,
  more: MoreVertical,
  spinner: Loader2,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  menu: Menu,
  refresh: RefreshCw,
  upload: Upload,
  download: Download,
  filter: Filter,
  external: ExternalLink
};

export const Icon: React.FC<IconProps> = ({ name, className = '', size = 20 }) => {
  const IconComponent = iconComponents[name];
  return <IconComponent size={size} className={className} />;
};

export const Icons = {
  search: (props: React.ComponentProps<typeof Search>) => <Search {...props} />,
  settings: (props: React.ComponentProps<typeof Settings>) => <Settings {...props} />,
  user: (props: React.ComponentProps<typeof User>) => <User {...props} />,
  home: (props: React.ComponentProps<typeof Home>) => <Home {...props} />,
  logout: (props: React.ComponentProps<typeof LogOut>) => <LogOut {...props} />,
  package: (props: React.ComponentProps<typeof Package>) => <Package {...props} />,
  layers: (props: React.ComponentProps<typeof Layers>) => <Layers {...props} />,
  shield: (props: React.ComponentProps<typeof ShieldAlert>) => <ShieldAlert {...props} />,
  activity: (props: React.ComponentProps<typeof Activity>) => <Activity {...props} />,
  chart: (props: React.ComponentProps<typeof BarChart2>) => <BarChart2 {...props} />,
  eye: (props: React.ComponentProps<typeof Eye>) => <Eye {...props} />,
  users: (props: React.ComponentProps<typeof Users>) => <Users {...props} />,
  warning: (props: React.ComponentProps<typeof AlertTriangle>) => <AlertTriangle {...props} />,
  success: (props: React.ComponentProps<typeof CheckCircle>) => <CheckCircle {...props} />,
  info: (props: React.ComponentProps<typeof Info>) => <Info {...props} />,
  close: (props: React.ComponentProps<typeof X>) => <X {...props} />,
  bell: (props: React.ComponentProps<typeof Bell>) => <Bell {...props} />,
  calendar: (props: React.ComponentProps<typeof Calendar>) => <Calendar {...props} />,
  file: (props: React.ComponentProps<typeof FileText>) => <FileText {...props} />,
  message: (props: React.ComponentProps<typeof MessageCircle>) => <MessageCircle {...props} />,
  plus: (props: React.ComponentProps<typeof Plus>) => <Plus {...props} />,
  trash: (props: React.ComponentProps<typeof Trash>) => <Trash {...props} />,
  edit: (props: React.ComponentProps<typeof Edit>) => <Edit {...props} />,
  more: (props: React.ComponentProps<typeof MoreVertical>) => <MoreVertical {...props} />,
  spinner: (props: React.ComponentProps<typeof Loader2>) => <Loader2 {...props} />,
  arrowRight: (props: React.ComponentProps<typeof ArrowRight>) => <ArrowRight {...props} />,
  arrowLeft: (props: React.ComponentProps<typeof ArrowLeft>) => <ArrowLeft {...props} />,
  chevronRight: (props: React.ComponentProps<typeof ChevronRight>) => <ChevronRight {...props} />,
  chevronLeft: (props: React.ComponentProps<typeof ChevronLeft>) => <ChevronLeft {...props} />,
  chevronDown: (props: React.ComponentProps<typeof ChevronDown>) => <ChevronDown {...props} />,
  chevronUp: (props: React.ComponentProps<typeof ChevronUp>) => <ChevronUp {...props} />,
  menu: (props: React.ComponentProps<typeof Menu>) => <Menu {...props} />,
  refresh: (props: React.ComponentProps<typeof RefreshCw>) => <RefreshCw {...props} />,
  upload: (props: React.ComponentProps<typeof Upload>) => <Upload {...props} />,
  download: (props: React.ComponentProps<typeof Download>) => <Download {...props} />,
  filter: (props: React.ComponentProps<typeof Filter>) => <Filter {...props} />,
  external: (props: React.ComponentProps<typeof ExternalLink>) => <ExternalLink {...props} />
};
