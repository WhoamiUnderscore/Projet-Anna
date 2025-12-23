"use client"

import { useEffect } from "react"
import { v4 as uuidv4 } from 'uuid'
import { marked } from "marked"
import { useParams } from "next/navigation" 
import Link from "next/link"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from "@fortawesome/free-solid-svg-icons"

import useEditor from "@/hook/useEditor"
import useFetch from "@/hook/useFetch"
import Loading from "@/components/loading"

import { type F_Cour } from "@/types/cour-types"

type BlockType = {
  id: string,
  markdown: string,
  render: string | Promise<string>,
  visible: boolean
}

export default function CourPage(){
  const { id } = useParams<{ id: string }>() 
  const { loading, fetchResult, updateData } = useFetch<F_Cour>(`/cours?id=${id}`);

  const editor = useEditor({});

  function prepareUpdate(){
    let markdown_content: string[] = [];
    let validContent = {
      content: "",
      image_number: 0,
    };

    editor.blocks.forEach(block => {
      markdown_content.push(block.markdown)
    })

    validContent.content = markdown_content.join("|/|");
    validContent.image_number = editor.allFiles.length;

    for(let i = 0; i < validContent.image_number; i++ ){
      let key_name = `image-${i}`;
      // @ts-expect-error 
      validContent[key_name] = editor.allFiles[i].file
    }

    updateData(validContent, `/cours/content?id=${id}`)
  }

  useEffect(() => {
    if ( !fetchResult || !fetchResult.data ) return 

    const savedContent = sessionStorage.getItem("content");
    let content: (BlockType | string)[] = [];

    if (savedContent) {
      content = JSON.parse(savedContent);
    }

    if ( content.length < 1 ){
      content = fetchResult.data.content.split("|/|").filter((v: string) => v !== "");
    }

    content.forEach((c: string | BlockType) => {
      let value;

      if ( typeof c !== "string" ) {
        value = c.markdown
      } else {
        value = c
      }

      const tokens = marked.lexer(value);

      const newBlock = {
        id: uuidv4(),
        markdown: value,
        render: marked.parser(tokens),
        visible: true
      }

      editor.updateBlocks(newBlock)
    })
  }, [fetchResult])

  return <main className="cour-page">
    <Loading loading={loading} />

    <Link href='/dashboard/autres'>Retour</Link>

    <section className="input-file-container">
      <button className="ui-input-file">Ajouter une image</button>
      <input 
        type="file" 
        ref={editor.file_input_ref} 
        onChange={() => editor.handleFile()} 
        className="editor-add-input"
      />
    </section>

      <section className='renderer-section' ref={editor.container_ref} onClick={editor.handleContainerClick}>
        {
          editor.blocks.map((value, i) => (
            <div
              key={value.id}
              data-id={value.id}
              style={{display: value.visible ? "unset" : "none"}}
              onClick={(e) => editor.createUpdateValue(value, e.target)}
              dangerouslySetInnerHTML={{ __html: value.render }}
            />
          ))
        }

        {
          editor.updateValue && (
            <textarea 
              id={`update-${editor.updateValue.id}`} 
              className={`text-editor`} 
              ref={editor.update_textarea_ref} 
              value={editor.updateValue.value} 
              onChange={(e) => editor.handleUpdateChange(e)} 
              onBlur={(e) => {
                if ( !editor.update_textarea_ref || !editor.update_textarea_ref.current) return

                editor.reCreateBlockFromUpdate(editor.update_textarea_ref.current.value)
              }} 
              onKeyDown={(e) => editor.handleKeyDown(e)}
            />
          )
        }
      </section>


      <textarea 
        className="text-editor" 
        placeholder="Entre ton texte ici" 
        value={editor.editorValue} 
        onChange={editor.handleChange} 
      />

      <button className="save-button" onClick={prepareUpdate}>
        <FontAwesomeIcon icon={faCheck} />
      </button>
  </main>
}
