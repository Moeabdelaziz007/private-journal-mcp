import { KnowledgeGraph } from '../src/knowledgeGraph';

test('builds graph and links similar entries', () => {
  const kg = new KnowledgeGraph();
  kg.buildFromEntries([
    { id: 'a', title: 'deploy bot', body: 'deploy to prod' },
    { id: 'b', title: 'deploy infra', body: 'k8s deploy' },
    { id: 'c', title: 'note', body: 'random' },
  ]);
  const json = kg.toJSON();
  expect(json.nodes.length).toBe(3);
  // على الأقل edge واحد من 'a' إلى 'b'
  expect(json.edges.length).toBeGreaterThan(0);
});
