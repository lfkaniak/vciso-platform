// react-pdf Document template for artifact export.
// Paleta: #1e3a5f (azul escuro), #4a5568 (grafite), #e53e3e (acento alertas)
// Client-side only — never import in Edge runtime code.

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { GeneratedArtifact } from '@/types/index';

const COLORS = {
  navy: '#1e3a5f',
  graphite: '#4a5568',
  red: '#e53e3e',
  lightGray: '#f7f9fc',
  border: '#e2e8f0',
  white: '#ffffff',
} as const;

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.white,
    padding: 0,
  },
  // --- Cover page ---
  cover: {
    flex: 1,
    backgroundColor: COLORS.navy,
    padding: 48,
    justifyContent: 'space-between',
  },
  coverBrand: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    lineHeight: 1.3,
    marginBottom: 16,
  },
  coverOrg: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  coverMeta: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  // --- Content pages ---
  contentPage: {
    flex: 1,
    padding: '36 48',
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pageHeaderTitle: {
    fontSize: 8,
    color: COLORS.graphite,
    letterSpacing: 1,
  },
  pageHeaderOrg: {
    fontSize: 8,
    color: COLORS.graphite,
  },
  // --- Typography ---
  h1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 12,
    marginTop: 8,
  },
  h2: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.navy,
    marginBottom: 8,
    marginTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  h3: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.graphite,
    marginBottom: 6,
    marginTop: 12,
  },
  paragraph: {
    fontSize: 9,
    color: COLORS.graphite,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 9,
    color: COLORS.graphite,
    lineHeight: 1.5,
    marginBottom: 4,
    marginLeft: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableHeader: {
    backgroundColor: COLORS.lightGray,
    padding: '6 8',
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.navy,
    flex: 1,
  },
  tableCell: {
    padding: '5 8',
    fontSize: 8,
    color: COLORS.graphite,
    flex: 1,
  },
  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: 'rgba(74,85,104,0.5)',
  },
  pageNumber: {
    fontSize: 7,
    color: 'rgba(74,85,104,0.5)',
  },
});

// Parse raw markdown into structured blocks for rendering
interface Block {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'list' | 'table-row' | 'divider';
  text: string;
  cells?: string[];
  isHeader?: boolean;
}

function parseMarkdownBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n');
  const blocks: Block[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === '---') continue;

    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.slice(2) });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3) });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4) });
    } else if (trimmed.startsWith('|')) {
      const cells = trimmed.split('|').slice(1, -1).map((c) => c.trim());
      // Skip separator rows like |---|---|
      if (cells.every((c) => /^-+$/.test(c))) continue;
      const isHeader = blocks.length > 0 && blocks[blocks.length - 1].type !== 'table-row';
      blocks.push({ type: 'table-row', text: trimmed, cells, isHeader });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\./.test(trimmed)) {
      blocks.push({ type: 'list', text: trimmed.replace(/^[-*]\s+|\d+\.\s+/, '') });
    } else {
      blocks.push({ type: 'paragraph', text: trimmed });
    }
  }

  return blocks;
}

function renderBlock(block: Block, idx: number) {
  switch (block.type) {
    case 'h1':
      return <Text key={idx} style={styles.h1}>{block.text}</Text>;
    case 'h2':
      return <Text key={idx} style={styles.h2}>{block.text}</Text>;
    case 'h3':
      return <Text key={idx} style={styles.h3}>{block.text}</Text>;
    case 'paragraph':
      return <Text key={idx} style={styles.paragraph}>{block.text}</Text>;
    case 'list':
      return <Text key={idx} style={styles.listItem}>• {block.text}</Text>;
    case 'table-row':
      return (
        <View key={idx} style={styles.tableRow}>
          {(block.cells ?? []).map((cell, ci) => (
            <Text
              key={ci}
              style={block.isHeader ? styles.tableHeader : styles.tableCell}
            >
              {cell}
            </Text>
          ))}
        </View>
      );
    default:
      return null;
  }
}

interface ArtifactPDFTemplateProps {
  artifact: GeneratedArtifact;
}

export function ArtifactPDFTemplate({ artifact }: ArtifactPDFTemplateProps) {
  const blocks = parseMarkdownBlocks(artifact.content);
  const date = artifact.generatedAt.toLocaleDateString('pt-BR');

  return (
    <Document title={artifact.title} author="vCISO Platform">
      {/* Cover page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.coverBrand}>vCISO Platform</Text>
          <View>
            <Text style={styles.coverTitle}>{artifact.title}</Text>
            <Text style={styles.coverOrg}>{artifact.context.organizationName}</Text>
            <Text style={styles.coverMeta}>
              {artifact.context.sector} · Maturidade: {artifact.context.maturityLevel} · {date}
            </Text>
          </View>
          <Text style={styles.coverMeta}>Confidencial — uso interno</Text>
        </View>
      </Page>

      {/* Content page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentPage}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageHeaderTitle}>vCISO PLATFORM</Text>
            <Text style={styles.pageHeaderOrg}>{artifact.context.organizationName}</Text>
          </View>
          {blocks.map((block, idx) => renderBlock(block, idx))}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Gerado pelo vCISO Platform · {date}</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
