import {
  AppWindowMacIcon,
  BinaryIcon,
  BlendIcon,
  BracesIcon,
  CropIcon,
  EraserIcon,
  FileCode2Icon,
  FileTypeIcon,
  GlobeIcon,
  Grid3x3Icon,
  HashIcon,
  ImageIcon,
  ImagesIcon,
  KeyRoundIcon,
  LayersIcon,
  LayoutGridIcon,
  MonitorSmartphoneIcon,
  NetworkIcon,
  PaletteIcon,
  QrCodeIcon,
  RegexIcon,
  StretchHorizontalIcon,
  TableIcon,
  TextSelectIcon,
  VectorSquareIcon,
  WindIcon,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { ToolLink } from '#/lib/tools'

export type ToolIcon = ComponentType<{
  className?: string
  'aria-hidden'?: boolean
}>

export const TOOL_ICONS: Record<ToolLink['to'], ToolIcon> = {
  '/tools/json-formatter': BracesIcon,
  '/tools/csv-json': TableIcon,
  '/tools/regex': RegexIcon,
  '/tools/text-diff': TextSelectIcon,
  '/tools/text-cleaner': EraserIcon,
  '/tools/image-compress': ImageIcon,
  '/tools/image-crop': CropIcon,
  '/tools/image-format': ImagesIcon,
  '/tools/favicon': AppWindowMacIcon,
  '/tools/svg-editor': VectorSquareIcon,
  '/tools/nine-slice': LayoutGridIcon,
  '/tools/transparent': BlendIcon,
  '/tools/hex-rgba': PaletteIcon,
  '/tools/flexbox': StretchHorizontalIcon,
  '/tools/box-shadow': LayersIcon,
  '/tools/css-grid': Grid3x3Icon,
  '/tools/base64': BinaryIcon,
  '/tools/qrcode': QrCodeIcon,
  '/tools/jwt': KeyRoundIcon,
  '/tools/xml-json': FileCode2Icon,
  '/tools/ip-lookup': NetworkIcon,
  '/tools/dns-lookup': GlobeIcon,
  '/tools/browser-info': MonitorSmartphoneIcon,
  '/tools/http-status': HashIcon,
  '/tools/mime': FileTypeIcon,
  '/tools/tailwind-cheat-sheet': WindIcon,
}
