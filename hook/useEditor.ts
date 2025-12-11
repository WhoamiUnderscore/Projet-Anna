import { useEffect, useState, useRef } from "react"
import { marked } from "marked"

type BlockType = {
  id: string,
  markdown: string,
  render: string,
  visible: boolean
}

type UpdateType = {
  id: string,
  value: string,
  updated: boolean
}

export default function useEditor() {
  // =====
  // Init Values
  // =====
  const [blocks, setBlocks] = useState<BlockType[]>([]);
  const [editorValue, setEditorValue] = useState<string>("");
  const [updateValue, setUpdateValue] = useState<UpdateType | null>(null);

  const container_ref = useRef<HTMLSectionElement>(null);
  const file_input_ref = useRef<HTMLTextAreaElement>(null);
  const update_textarea_ref = useRef<HTMLTextAreaElement>(null)


  // ======
  // Functions
  // ======
  function handleChange(event: Event) {
    const value = event.target.value;
    const last_letter = value[value.length - 1];

    if (!value.endsWith("\n")) {
      setEditorValue(value);
      return
    }

    const value_without_break = value.slice(0, -1);

    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        markdown: value_without_break, 
        render: marked.parse(value_without_break),
        visible: true
      }
    ]);
    setEditorValue("");
  } 

  function handleUpdateChange(event: Event) {
    const value = event.target.value;
    const last_letter = value[value.length - 1];

    if ( last_letter !== "\n") {
      setUpdateValue((prev) => ({
        ...prev,
        value,
      }));
      return
    }

    const value_without_break = value.slice(0, -1);
    reCreateBlockFromUpdate(value_without_break)
  }

  function reCreateBlockFromUpdate(value: string) {
    setBlocks(prev => {
      return prev.map(b => b.id === updateValue.id ? {
        ...b,
        visible: true,
        markdown: value,
        render: marked.parse(value)
      } : b )
    });
    setUpdateValue(null)
  }

  function handleFile() {
    if ( !file_input_ref ) return

    const file = file_input_ref.current.files[0];

    const imageURL = URL.createObjectURL(file);
    const markdown = `![text alternatif](${imageURL})`;
    const render = `<img src="${imageURL}" />`

    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        markdown,
        render,
        visible: true
      }
    ]);

    file_input_ref.current.value = "";
  }

  function createUpdateValue(value: BlockType, elementClick: HtmlElement) {
    if ( !container_ref || elementClick instanceof HTMLImageElement ) return

    if ( updateValue ) {
      reCreateBlockFromUpdate(updateValue.value)
    }

    setUpdateValue({
      id: value.id,
      value: value.markdown,
      updated: false
    })

    setBlocks((prev) => prev.map(b => b.id === value.id ? { ...b, visible: false } : b))
  }

  useEffect(() => {
    if ( !container_ref || !updateValue || updateValue.updated || !update_textarea_ref ) return

    const domIndex = Array.from(container_ref.current.children).findIndex((el) => el.id === updateValue.id);

    container_ref.current.insertBefore(update_textarea_ref.current, container_ref.current.children[domIndex])
    setUpdateValue((prev) => ({
      ...prev,
      updated: true
    }))

    update_textarea_ref.current.addEventListener("focusout", () => reCreateBlockFromUpdate(update_textarea_ref.current.value))
  }, [container_ref, updateValue, update_textarea_ref])

  return { blocks, editorValue, updateValue, container_ref, file_input_ref, update_textarea_ref, handleChange, handleUpdateChange, handleFile, createUpdateValue}
}
