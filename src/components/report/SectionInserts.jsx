/**
 * SectionInserts.jsx
 *
 * "Insert into the report" — the client's own pictures, each dropped at the end of a
 * section they choose. Sits inside the Edit Details panel.
 *
 * Two decisions worth knowing:
 *  - The section list is fetched from the server, not hard-coded, because which sections a
 *    report has depends on its purpose and on what was actually generated. A stale menu
 *    would offer a section the report does not contain.
 *  - Every picture is placed at ONE standard width in the document whatever the file's own
 *    size, so a report never reads as a scrapbook. That is enforced in the Word builder,
 *    not here; the note under the picker says so plainly.
 */
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, Loader2, Trash2, Save } from "lucide-react";
import { getReportSections, getInserts, saveInserts } from "@/api/generationService";
import { useToast } from "@/components/ui/use-toast";

const MAX_MB = 6;

export default function SectionInserts({ projectId }) {
  const { toast } = useToast();
  const [sections, setSections] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef(null);
  const [pendingSection, setPendingSection] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getReportSections(projectId), getInserts(projectId)])
      .then(([s, i]) => {
        if (cancelled) return;
        const list = s?.sections || [];
        setSections(list);
        setItems(i?.inserts || []);
        setPendingSection(list[0] || "");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [projectId]);

  const pick = () => {
    if (!pendingSection) return;
    fileRef.current?.click();
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";                 // so the same file can be picked again
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "That is not an image", description: "Pick a JPG or PNG.",
              variant: "destructive" });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast({
        title: "That picture is too large",
        description: `It is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${MAX_MB} MB.`,
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setItems((p) => [...p, { section: pendingSection, data_url: String(reader.result),
                               caption: "" }]);
      setDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const update = (idx, patch) => {
    setItems((p) => p.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
    setDirty(true);
  };

  const remove = (idx) => {
    setItems((p) => p.filter((_, i) => i !== idx));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveInserts(projectId, items);
      setDirty(false);
      toast({
        title: items.length ? "Saved" : "All pictures removed",
        description: "Download the Word report to see it — no need to regenerate.",
      });
    } catch (err) {
      toast({ title: "Could not save", description: err?.message || "Please try again.",
              variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading the report's sections…
      </div>
    );
  }

  if (!sections.length) {
    return (
      <p className="text-sm text-muted-foreground py-3">
        Generate the report first — then you can add your own pictures to any of its sections.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-semibold text-sm">Insert your own pictures</h4>
        {dirty && (
          <Button size="sm" onClick={save} disabled={saving} className="gap-1.5 h-8">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Save className="w-3.5 h-3.5" />}
            Save
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Choose a section, add a photograph, and it is placed at the end of that section of
        the Word report — every picture at the same standard width, with a numbered caption
        that also appears in the List of Figures.
      </p>

      <div className="flex flex-wrap items-end gap-2 mb-4">
        <div className="flex-1 min-w-[220px]">
          <Label className="text-xs text-muted-foreground mb-1 block">Section</Label>
          <select
            className="w-full text-sm rounded-md border border-border bg-background px-2 py-2"
            value={pendingSection}
            onChange={(e) => setPendingSection(e.target.value)}
          >
            {sections.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Button variant="outline" onClick={pick} className="gap-1.5">
          <ImagePlus className="w-4 h-4" /> Add picture
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nothing added yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-3 border rounded-lg p-2">
              <img
                src={it.data_url}
                alt=""
                className="w-16 h-12 object-cover rounded border flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <select
                  className="w-full text-xs rounded-md border border-border bg-background px-2 py-1 mb-1"
                  value={sections.includes(it.section) ? it.section : ""}
                  onChange={(e) => update(i, { section: e.target.value })}
                >
                  {!sections.includes(it.section) && (
                    <option value="">{it.section} (no longer in the report)</option>
                  )}
                  {sections.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Input
                  className="h-8 text-xs"
                  placeholder="Caption (optional) — e.g. Our production floor"
                  value={it.caption || ""}
                  onChange={(e) => update(i, { caption: e.target.value })}
                />
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0"
                      onClick={() => remove(i)} title="Remove">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
