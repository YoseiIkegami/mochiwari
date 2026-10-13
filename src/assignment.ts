export type Item = { id: string; name: string; owner: string; ready: boolean };

export function summarizeAssignments(members: string[], items: Item[]) {
  return members.map((member) => {
    const assigned = items.filter((item) => item.owner === member);
    return { member, assigned: assigned.length, ready: assigned.filter((item) => item.ready).length };
  });
}

export function assignmentStatus(members: string[], items: Item[]) {
  const summary = summarizeAssignments(members, items);
  const assigned = items.filter((item) => item.owner).length;
  const counts = summary.map((entry) => entry.assigned);
  return {
    assigned,
    unassigned: items.length - assigned,
    ready: items.filter((item) => item.ready).length,
    spread: counts.length ? Math.max(...counts) - Math.min(...counts) : 0,
  };
}
