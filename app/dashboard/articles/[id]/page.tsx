"use client"

import * as React from "react"
import { v4 as uuidv4 } from 'uuid'
import { marked } from "marked"
import { useParams } from "next/navigation" 

import useEditor from "@/hook/useEditor"
import useFetch from "@/hook/useFetch"

export default function ArticlePage(){
  const { id } = useParams<{ id: string }>() 
  const { loading, fetchResult, updateData } = useFetch<F_ChronologieElement>(`/article?id=${id}`);

  const editor = useEditor();

  function prepareUpdate(){
    let markdown_content = [];
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
      validContent[key_name] = editor.allFiles[i]
    }

    updateData(validContent, `/article/content?id=${id}`)
  }

  React.useEffect(() => {
    if ( !fetchResult || !fetchResult.data ) return 

    const content = fetchResult.data.content.split("|/|").filter(v => v !== "");
    console.log(content)

    content.forEach(c => {
      const newBlock = {
        id: uuidv4(),
        markdown: c,
        render: marked.parse(c),
        visible: true
      }

      editor.updateBlocks(newBlock)
    })
  }, [fetchResult])
    
  return <main className={"article-page"}>
      <section className={`renderer-section`} ref={editor.container_ref}>
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
          editor.updateValue && <textarea id={`update-${editor.updateValue.id}`} className={`text-editor`} value={editor.updateValue.value} onChange={(e) => editor.handleUpdateChange(e)} ref={editor.update_textarea_ref} onBlur={(e) => editor.reCreateBlockFromUpdate(editor.update_textarea_ref.current.value)} onKeyDown={(e) => editor.handleKeyDown(e)}></textarea>
        }
      </section>
      <textarea className={`text-editor`} placeholder={"Entre ton texte ici"} value={editor.editorValue} onChange={editor.handleChange}>
      </textarea>
      <input type="file" ref={editor.file_input_ref}/>
      <button onClick={() => editor.handleFile()}>Add Image</button>

      <button onClick={prepareUpdate}>Enregistrer</button>
  </main>
}
