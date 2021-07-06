import { useState, useCallback, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend, NativeTypes } from "react-dnd-html5-backend"
import { useDrop } from "react-dnd"
import { PDFDocument } from "pdf-lib"
import {saveAs} from "file-saver"
import styled, { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  html * {
    font-size: 1em !important;
    color: #000 !important;
    font-family: Arial !important;
  }
`

const list = (files) => {
  const label = (file) =>
    `'${file.name}' of size '${file.size}' and type '${file.type}'`
  return files.map((file) => <li key={file.name}>{label(file)}</li>)
}

const FileList = ({ files }) => {
  if (files.length === 0) {
    return <div>&#129428;</div>
  }
  return <div>{list(files)}</div>
}

const Div = styled.div`
  border: 1px solid gray;
  height: 15rem;
  width: 15rem;
  padding: 2rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 1rem;
`

const TargetBox = (props) => {
  const { onDrop } = props
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item) {
        if (onDrop) {
          onDrop(item)
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [props]
  )

  const isActive = canDrop && isOver
  return (
    <Div ref={drop}>
      {isActive ? "Release to drop" : "Drag file here"}
    </Div>
  )
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: #F8F9FA;
`

function App() {
  const [droppedFiles, setDroppedFiles] = useState([])

  const handleFileDrop = useCallback(
    (item) => {
      if (item) {
        const files = item.files
        setDroppedFiles(files)
      }
    },
    [setDroppedFiles]
  )
  useEffect(() => {
    if (droppedFiles.length) {
      droppedFiles.forEach(async (file) => {
        const existingPdfBytes = await file.arrayBuffer()
        const pdfDocInput = await PDFDocument.load(existingPdfBytes)
        const pdfDocOutput = await PDFDocument.create()
        const pages = pdfDocInput.getPages()
        if (pages.length) {
          for (let i = 0; i < pages.length; i++) {
            const [page] = await pdfDocOutput.copyPages(pdfDocInput, [i])
            pdfDocOutput.addPage(page)
            pdfDocOutput.addPage()
          }
        }
        const blob = new Blob([await pdfDocOutput.save()], {
          type: "application/pdf;charset=utf-8",
        })
        saveAs(blob, `${Date.now()}-${file.name}`)
      })
    }
  }, [droppedFiles])

  return (
    <>
      <GlobalStyle />
      <DndProvider backend={HTML5Backend}>
    <Container>
      <TargetBox onDrop={handleFileDrop} />
      <FileList files={droppedFiles} />
    </Container>
    </DndProvider>
    </>
  )
}

export default App
