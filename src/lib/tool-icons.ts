import {
  BinaryIcon,
  BracesIcon,
  GlobeIcon,
  HashIcon,
  ImageIcon,
  ImagesIcon,
  KeyRoundIcon,
  MonitorSmartphoneIcon,
  NetworkIcon,
  PaletteIcon,
  RegexIcon,
  TableIcon,
  TextSelectIcon,
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
  '/tools/image-compress': ImageIcon,
  '/tools/image-format': ImagesIcon,
  '/tools/hex-rgba': PaletteIcon,
  '/tools/base64': BinaryIcon,
  '/tools/jwt': KeyRoundIcon,
  '/tools/ip-lookup': NetworkIcon,
  '/tools/dns-lookup': GlobeIcon,
  '/tools/browser-info': MonitorSmartphoneIcon,
  '/tools/http-status': HashIcon,
}
