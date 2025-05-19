import { fetchComments } from "../actions/comment/commentActions";

function flattenComments(comments) {
  const map = new Map();
  comments.forEach((c) => {
    map.set(c.comment_id, { ...c, children: [] });
  });

  const roots = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  function dfs(nodes, isRoot = false) {
    nodes.sort((a, b) => {
      const ta = new Date(a.created_at),
        tb = new Date(b.created_at);
      return isRoot ? tb - ta : ta - tb;
    });

    let arr = [];
    nodes.forEach((n) => {
      arr.push(n);
      if (n.children.length) {
        arr = arr.concat(dfs(n.children, false));
      }
    });

    return arr;
  }

  return dfs(roots, true);
}

export async function fetchAndFlattenComments(post_id) {
  const data = await fetchComments(post_id);
  return flattenComments(data);
}
