import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Alert01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  CheckListIcon,
  CircleIcon as CircleSvgIcon,
  CodeIcon,
  BookOpen01Icon,
  Delete02Icon,
  Edit02Icon,
  File01Icon,
  FlashIcon,
  GithubIcon,
  GlobeIcon,
  Heading01Icon,
  Heading02Icon,
  Image01Icon,
  InstagramIcon,
  LeftToRightListBulletIcon,
  Link01Icon,
  Linkedin01Icon,
  LockIcon,
  Logout01Icon,
  Maximize02Icon,
  Minimize02Icon,
  Moon01Icon,
  MoreVerticalIcon,
  Note01Icon,
  QuoteUpCircleIcon,
  Search01Icon,
  Settings02Icon,
  Share01Icon,
  Share02Icon,
  SparklesIcon,
  Sun01Icon,
  TextBoldIcon,
  TextItalicIcon,
  Tick01Icon,
  TwitterIcon,
  UserGroupIcon,
  UserIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons"

type IconProps = Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">

const withIcon = (icon: unknown) => (props: IconProps) =>
  <HugeiconsIcon icon={icon} {...props} />

export const FileText = withIcon(File01Icon)
export const FileTextIcon = withIcon(File01Icon)
export const Note = withIcon(Note01Icon)
export const Users = withIcon(UserGroupIcon)
export const UserMultiple = withIcon(UserGroupIcon)
export const UserSingle = withIcon(UserIcon)
export const UserProfile = withIcon(UserIcon)
export const Lock = withIcon(LockIcon)
export const Zap = withIcon(FlashIcon)
export const Code = withIcon(CodeIcon)
export const Share = withIcon(Share01Icon)
export const Share2 = withIcon(Share02Icon)
export const Edit = withIcon(Edit02Icon)
export const Globe = withIcon(GlobeIcon)
export const Link = withIcon(Link01Icon)
export const AlertTriangle = withIcon(Alert01Icon)
export const Github = withIcon(GithubIcon)
export const Twitter = withIcon(TwitterIcon)
export const Linkedin = withIcon(Linkedin01Icon)
export const Instagram = withIcon(InstagramIcon)
export const Youtube = withIcon(YoutubeIcon)
export const BookOpen = withIcon(BookOpen01Icon)
export const X = withIcon(Cancel01Icon)
export const XIcon = withIcon(Cancel01Icon)
export const Plus = withIcon(Add01Icon)
export const PlusIcon = withIcon(Add01Icon)
export const ChevronLeft = withIcon(ArrowLeft01Icon)
export const ChevronRight = withIcon(ArrowRight01Icon)
export const ChevronDownIcon = withIcon(ArrowDown01Icon)
export const ChevronUpIcon = withIcon(ArrowUp01Icon)
export const ChevronRightIcon = withIcon(ArrowRight01Icon)
export const Search = withIcon(Search01Icon)
export const Trash2 = withIcon(Delete02Icon)
export const Settings = withIcon(Settings02Icon)
export const LogOut = withIcon(Logout01Icon)
export const User = withIcon(UserIcon)
export const Maximize2 = withIcon(Maximize02Icon)
export const Minimize2 = withIcon(Minimize02Icon)
export const Sparkles = withIcon(SparklesIcon)
export const Sun = withIcon(Sun01Icon)
export const Moon = withIcon(Moon01Icon)
export const CheckIcon = withIcon(Tick01Icon)
export const Circle = withIcon(CircleSvgIcon)
export const CircleIcon = withIcon(CircleSvgIcon)
export const Bold = withIcon(TextBoldIcon)
export const Italic = withIcon(TextItalicIcon)
export const Heading1 = withIcon(Heading01Icon)
export const Heading2 = withIcon(Heading02Icon)
export const List = withIcon(LeftToRightListBulletIcon)
export const Quote = withIcon(QuoteUpCircleIcon)
export const Image = withIcon(Image01Icon)

export type { IconProps }

