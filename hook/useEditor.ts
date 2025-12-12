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
  // =====
  // Init Values
  // =====
  const [blocks, setBlocks] = useState<BlockType[]>([]);
  const [editorValue, setEditorValue] = useState<string>("");
  const [updateValue, setUpdateValue] = useState<UpdateType | null>(null);
  const [shouldInsertUpdate, setShouldInsertUpdate] = useState(false)
  const [allFiles, setAllFiles] = useState<{id: string, file: File}[]>([])

  const container_ref = useRef<HTMLSectionElement>(null);
  const file_input_ref = useRef<HTMLTextAreaElement>(null);
  const update_textarea_ref = useRef<HTMLTextAreaElement>(null)


  // ======
  // Functions
  // ======
  function handleChange(event: Event) {
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
    const last_letter = value[value.length - 1];

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
    const id = uuidv4();

    setAllFiles((prev) => [...prev, {
      id,
      file,
    }]);

    const imageURL = URL.createObjectURL(file);
    const markdown = `![text alternatif](${imageURL})`;
    const render = `<img src="${imageURL}" class="image" data-id="${id}"/>`

    setBlocks((prev) => [
      ...prev,
      {
        id,
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
    console.log(updateValue)

    const domIndex = Array.from(container_ref.current.children)
      .findIndex((el) => el.getAttribute("data-id") === updateValue.id);

    container_ref.current.insertBefore(update_textarea_ref.current, container_ref.current.children[domIndex])
    update_textarea_ref.current.style.height = `${update_textarea_ref.current.scrollHeight}px`
    update_textarea_ref.current.focus();

    const value = update_textarea_ref.current.value
    update_textarea_ref.current.value = "";
    update_textarea_ref.current.value = value;


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

  function updateBlocks(value: BlockType) {
    setBlocks((prev) => [...prev, value])
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      console.log(updateValue)
    if ( !updateValue ) return 


    if (e.key === "Backspace" && updateValue.value === "") {
      setBlocks((prev) => {
        return prev.filter(b => b.id !== updateValue.id)
      })
      setUpdateValue(null)
    }
  }

  useEffect(() => {
    console.log(allFiles)
    const images = document.querySelectorAll(".image")

    images.forEach((img) => {
      img.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        
        setAllFiles((prev) => prev.filter(f => f.id !== id));
        setBlocks((prev) => prev.filter(b => b.id !== id));
      })
    })
  },[allFiles])

  return { blocks, editorValue, updateValue, container_ref, file_input_ref, update_textarea_ref, handleChange, handleUpdateChange, handleFile, createUpdateValue, allFiles, updateBlocks, reCreateBlockFromUpdate, handleKeyDown }
}
