export interface DocFrontmatter {
  title: string
  module: string
  route: string
  pdfRef: string
  videoUrl: string
  updatedAt: string
  tags: string[]
  permissionHints: string[]
  order: number
  version: string
  description: string
  menuGroup: string
  menuGroupLabel: string
  related: string[]
}

export interface DocPage extends Omit<DocFrontmatter, 'related'> {
  slug: string
  content: string
  related: Array<{ href: string; label: string }>
}

export interface DocsIndexItem extends DocFrontmatter {
  slug: string
}

export interface GroupedNav {
  group: string
  label: string
  items: DocsIndexItem[]
}

export interface VideoManifestEntry {
  docSlug: string
  videoPath: string
  thumbnailPath: string
  durationSec: number
  capturedAt: string
  sourceEnv: string
}

export interface MappingItem {
  pdf_section_id: string
  menu_group: string
  menu_group_label: string
  route: string
  doc_slug: string
  status: 'draft' | 'review' | 'published'
  title: string
  summary: string
  tags: string[]
  permission_hints: string[]
  related: string[]
}
