import { useEffect, useState, useRef } from "react"
import { marked } from "marked"
import { v4 as uuidv4 } from 'uuid'

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

type Props = {
  default_content?: string
}

export default function useEditor(props: Props) {
  const [blocks, setBlocks] = useState<BlockType[]>([]);
  const [editorValue, setEditorValue] = useState<string>("");
  const [updateValue, setUpdateValue] = useState<UpdateType | null>(null);
  const [lastUpdateId, setLastUpdateId] = useState<string>("");
  const [allFiles, setAllFiles] = useState<{id: string, file: File}[]>([])

  const container_ref = useRef<HTMLSectionElement>(null);
  const file_input_ref = useRef<HTMLTextAreaElement>(null);
  const update_textarea_ref = useRef<HTMLTextAreaElement>(null)


  useEffect(() => {
    // ======
    // This useEffect is used to positionnate the new update input in the right place
    // ======

    if ( !container_ref || !updateValue || updateValue.updated || !update_textarea_ref ) return

    const domIndex = Array.from(container_ref.current.children)
      .findIndex((el) => el.getAttribute("data-id") === updateValue.id);

    container_ref.current.insertBefore(update_textarea_ref.current, container_ref.current.children[domIndex])

    const value = update_textarea_ref.current.value
    update_textarea_ref.current.value = "";
    update_textarea_ref.current.value = value; // Positionnate the cursor at the end of the input
    update_textarea_ref.current.style.height = `${update_textarea_ref.current.scrollHeight}px`
    update_textarea_ref.current.focus();

    setLastUpdateId(updateValue.id)
    setUpdateValue(() => {
      const prev = updateValue;

      if ( !prev ) return null
      return {
        id: prev.id,
        value: prev.value,
        updated: true
      }
    })
  }, [container_ref, updateValue, update_textarea_ref])

  useEffect(() => {
    // ======
    // This useEffect is used to save blocks content to prevent loosing data on reload
    // ======

    if ( blocks.length > 0 ) {
      window.sessionStorage.setItem("content", JSON.stringify(blocks))
    }
  },[blocks])

  

  function handleChange(event: Event) {
    // Remove potential last update value
    if ( lastUpdateId !== "" ) {
      setLastUpdateId(null)
    }

    const input = event.target;
    input.style.height = `${input.scrollHeight}px`

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
        id: uuidv4(),
        markdown: value_without_break, 
        render: marked.parse(value_without_break),
        visible: true
      }
    ]);
    setEditorValue("");
  } 

  function handleUpdateChange(event: Event) {
    const input = event.target;

    input.style.height = `${input.scrollHeight}px`

    const value = event.target.value;
    const last_letter = value[value.length - 1]

    if ( last_letter !== "\n") {
      setUpdateValue((prev) => ({
        ...prev,
        value,
      }));
      return
    }

    const blocksIndex = blocks.findIndex(b => b.id === updateValue.id);

    const value_without_break = value.slice(0, -1);

    reCreateBlockFromUpdate(value_without_break)

    if ( value !== "" ) {
      insertUpdateValue(blocksIndex)
    }
  }

  function insertUpdateValue(blocksIndex: number){
      const newElement = {
        id: uuidv4(),
        markdown: "",
        render: "",
        visible: false
      }

      setBlocks((prev) => [
        ...prev.slice(0, blocksIndex+1),
        newElement,
        ...prev.slice(blocksIndex+1)
      ])

      setUpdateValue({
        id: newElement.id,
        value: newElement.markdown,
        updated: false
      })
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
    let index_update;
    let id = uuidv4;

    if ( lastUpdateId ) {
      index_update = blocks.findIndex(b => b.id == lastUpdateId)
    }

    setAllFiles((prev) => [...prev, {
      id,
      file,
    }]);

    const imageURL = URL.createObjectURL(file);
    const markdown = `![text alternatif](${imageURL})`;
    const render = `<img src="${imageURL}" class="image-block" data-id="${id}"/>`

    setBlocks((prev) => {
      const newElement = {
        id,
        markdown,
        render,
        visible: true
      };

      if ( index_update ) {
      return [
        ...prev.slice(0, index_update + 1),
        newElement,
        ...prev.slice(index_update+1),
      ]
      }

      return [
        ...prev,
        newElement
      ]
    });

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


  function updateBlocks(value: BlockType) {
    const dom = document.createElement("div")
    dom.innerHTML = value.render;

    const paragraph = dom.firstChild

    if ( paragraph.firstChild instanceof HTMLImageElement ) {
      paragraph.firstChild.classList.add("image-block");
      paragraph.firstChild.setAttribute("data-id", value.id);
    }

    if ( paragraph ) {
      value.render = paragraph.outerHTML;
    }

    setBlocks((prev) => [...prev, value])
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ( !updateValue ) return 

    if (e.key === "Backspace" && updateValue.value === "") {
      setBlocks((prev) => {
        return prev.filter(b => b.id !== updateValue.id)
      })
      setUpdateValue(null)
    }
  }

  function handleContainerClick(e) {
    const img = e.target.closest('.image-block');

    if (!img) return;

    const id = img.dataset.id;

    setBlocks(prev => prev.filter(b => b.id !== id));
    setAllFiles(prev => prev.filter(f => f.id !== id));
  }


  return { 
    blocks,
    editorValue,
    updateValue,
    allFiles,
    container_ref,
    file_input_ref,
    update_textarea_ref,

    handleChange,
    handleUpdateChange,
    handleFile,
    handleKeyDown,
    createUpdateValue,
    updateBlocks,
    reCreateBlockFromUpdate,
  }
}
