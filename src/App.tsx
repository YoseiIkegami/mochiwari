import { useMemo, useState } from "react";

import { assignmentStatus, summarizeAssignments, type Item } from "./assignment";

const initialItems: Item[] = [
  { id: "1", name: "テント", owner: "あや", ready: false },
  { id: "2", name: "クーラーボックス", owner: "", ready: false },
  { id: "3", name: "調理器具", owner: "たく", ready: true },
];

export default function App() {
  const [members, setMembers] = useState(["あや", "たく", "みさき"]);
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const summary = useMemo(() => summarizeAssignments(members, items), [members, items]);
  const status = useMemo(() => assignmentStatus(members, items), [members, items]);

  function updateMember(index: number, value: string) {
    const next = members.slice();
    const previous = next[index]!;
    next[index] = value;
    setMembers(next);
    if (previous) setItems((current) => current.map((item) => item.owner === previous ? { ...item, owner: value } : item));
    setCopied(false);
  }

  function addItem() {
    const name = newItem.trim();
    if (!name) {
      setNotice("持ち物の名前を入力してください。");
      return;
    }
    setItems((current) => [...current, { id: crypto.randomUUID(), name, owner: "", ready: false }]);
    setNewItem("");
    setNotice("");
    setCopied(false);
  }

  function updateItem(id: string, change: Partial<Item>) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...change } : item));
    setCopied(false);
  }

  async function copyList() {
    const lines = ["MOCHIWARI 持ち物分担", "", ...items.map((item) => `${item.ready ? "✓" : "□"} ${item.name}：${item.owner || "未担当"}`), "", `未担当 ${status.unassigned}件 / 準備済み ${status.ready}件`];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setNotice("分担表をコピーしました。");
    } catch {
      setNotice("コピーできませんでした。画面の内容を共有してください。");
    }
  }

  return <main className="mochiwari">
    <div className="shell">
      <a className="back" href="https://www.ikg-systems.com/#works">← IKG Systems</a>
      <header>
        <p className="eyebrow">PACK TOGETHER</p>
        <h1>MOCHI<span>WARI</span></h1>
        <p className="lead">持ち物を、みんなで分担。</p>
        <p className="caption">旅行やキャンプの共用品を決めて、未担当をなくす。</p>
      </header>

      <section className="overview" aria-label="分担の状況">
        <div><strong>{status.unassigned}</strong><span>未担当</span></div>
        <div><strong>{status.ready}/{items.length}</strong><span>準備済み</span></div>
        <div><strong>{status.spread}</strong><span>担当数の差</span></div>
      </section>

      <div className="workspace">
        <section className="panel">
          <div className="panel-title"><h2><span>01</span> メンバー</h2><small>{members.length}人</small></div>
          <div className="members">
            {members.map((member, index) => <label key={index}><span>{String(index + 1).padStart(2, "0")}</span><input aria-label={`メンバー${index + 1}の名前`} value={member} maxLength={30} onChange={(event) => updateMember(index, event.target.value)} /></label>)}
          </div>
          {members.length < 8 && <button className="text-button" type="button" onClick={() => { setMembers((current) => [...current, `メンバー${current.length + 1}`]); setCopied(false); }}>＋ メンバーを追加</button>}
          {members.length > 2 && <button className="text-button" type="button" onClick={() => { const removed = members.at(-1)!; setMembers((current) => current.slice(0, -1)); setItems((current) => current.map((item) => item.owner === removed ? { ...item, owner: "" } : item)); setCopied(false); }}>－ メンバーを減らす</button>}
          <div className="burden" aria-label="担当数">
            <h3>担当の偏り</h3>
            {summary.map((entry) => <div className="burden-row" key={entry.member}><span>{entry.member || "名前未入力"}</span><div aria-label={`${entry.assigned}件担当`}><i style={{ width: `${items.length ? entry.assigned / items.length * 100 : 0}%` }} /></div><b>{entry.assigned}件 <small>{entry.ready}済</small></b></div>)}
          </div>
        </section>

        <section className="panel items-panel">
          <div className="panel-title"><h2><span>02</span> 共通の持ち物</h2><small>{items.length}件</small></div>
          <form className="add-item" onSubmit={(event) => { event.preventDefault(); addItem(); }}>
            <input value={newItem} maxLength={60} placeholder="例：ランタン、救急セット…" onChange={(event) => setNewItem(event.target.value)} />
            <button type="submit">追加 ↗</button>
          </form>
          <div className="item-list">
            {items.map((item) => <article className={item.owner ? "item" : "item unassigned"} key={item.id}>
              <label className="ready"><input aria-label={`${item.name}を準備済みにする`} type="checkbox" checked={item.ready} onChange={(event) => updateItem(item.id, { ready: event.target.checked })} /><span>{item.ready ? "✓" : ""}</span></label>
              <input className="item-name" aria-label="持ち物の名前" value={item.name} maxLength={60} onChange={(event) => updateItem(item.id, { name: event.target.value })} />
              <select aria-label={`${item.name}の担当者`} value={item.owner} onChange={(event) => updateItem(item.id, { owner: event.target.value })}><option value="">未担当</option>{members.filter(Boolean).map((member) => <option key={member} value={member}>{member}</option>)}</select>
              <button className="delete" type="button" aria-label={`${item.name}を削除`} onClick={() => { setItems((current) => current.filter((currentItem) => currentItem.id !== item.id)); setCopied(false); }}>×</button>
            </article>)}
          </div>
        </section>
      </div>

      <section className="share-panel">
        <div><p className="eyebrow">TAKE IT WITH YOU</p><h2>分担表を共有する</h2><p>登録も保存もありません。コピーしてグループに送れます。</p></div>
        <button type="button" onClick={copyList}>{copied ? "コピーしました ✓" : "分担表をコピー ↗"}</button>
      </section>
      <p className="notice" role="status">{notice}</p>
      <footer><span>登録不要・このページ内だけで動作します</span><a href="https://www.ikg-systems.com/contact">感想を送る ↗</a></footer>
    </div>
  </main>;
}
