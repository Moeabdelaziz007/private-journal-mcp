// src/knowledgeGraph.ts
export type Node = { id: string; labels: string[]; meta?: any };
export type Edge = { from: string; to: string; label?: string };

export class KnowledgeGraph {
  nodes: Map<string, Node>;
  edges: Edge[];

  constructor() {
    this.nodes = new Map();
    this.edges = [];
  }

  addNode(id: string, labels: string[] = [], meta?: any) {
    if (!this.nodes.has(id)) this.nodes.set(id, { id, labels, meta });
    return this.nodes.get(id)!;
  }

  addEdge(from: string, to: string, label?: string) {
    this.edges.push({ from, to, label });
  }

  buildFromEntries(entries: Array<{ id?: string; title?: string; body?: string }>) {
    // بسيط: كل مذكّرة تصبح Node، ونربطها بالكلمات المشتركة (keywords)
    entries.forEach((e, idx) => {
      const id = e.id ?? `entry-${idx}`;
      this.addNode(id, [ ...(e.title ? [e.title] : []), ...(e.body ? [e.body.slice(0,50)] : []) ], { source: 'journal' });
    });

    // روابط بسيطة: إذا تشارك عنوان أو كلمة في أول 3 كلمات
    const keys = Array.from(this.nodes.values());
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const a = keys[i].labels.join(' ').split(/\s+/).slice(0,3);
        const b = keys[j].labels.join(' ').split(/\s+/).slice(0,3);
        if (a.some(tok => b.includes(tok))) {
          this.addEdge(keys[i].id, keys[j].id, 'keyword-match');
        }
      }
    }
  }

  toJSON() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
    };
  }
}
