import { useState, useCallback, useEffect, useRef } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend, NativeTypes } from "react-dnd-html5-backend"
import { useDrop } from "react-dnd"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import styled, { createGlobalStyle } from "styled-components"
import Confetti from "react-dom-confetti"
import DragDrop from "./DragDrop"
import Click from "./Click"

const GlobalStyle = createGlobalStyle`
  html * {
    font-size: 1em;
    font-family: 'Indie Flower', cursive !important;
  }
  body {
    margin: 0;
  }
`

const Button = styled.button`
  box-shadow: 0px 1px 0px 0px #fff6af;
  background: linear-gradient(to bottom, #ffec64 5%, #ffab23 100%);
  background-color: #ffec64;
  border-radius: 6px;
  border: 1px solid #ffaa22;
  display: inline-block;
  color: #333333;
  padding: 16px 31px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #ffee66;
  color: #d44141e3;

  height: 10rem;
  width: 16rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    box-shadow: 6px 8px 8px 1px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    background: linear-gradient(to bottom, #ffab23 5%, #ffec64 100%);
    background-color: #ffab23;
  }
  &:active {
    position: relative;
    top: 1px;
  }
  & span {
    font-size: 1.5em;
  }
`

const Input = styled.input`
  display: none;
`

const TargetBox = (props) => {
  const { onDrop, onChange } = props
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
  const fileInput = useRef(null)
  const isActive = canDrop && isOver
  const onClick = () => fileInput.current.click()
  return (
    <>
      <Input
        type="file"
        accept=".pdf"
        multiple
        ref={fileInput}
        onChange={onChange}
      />
      <Button ref={drop} onClick={onClick}>
        <DragDrop />
        <Click />
      </Button>
    </>
  )
}

const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #d4418e;
  background-image: linear-gradient(315deg, #d4418e 0%, #0652c5 74%);
`
// background: #f8f9fa;
// width: 100vw;

function App() {
  const [success, setSuccess] = useState(false)
  const [files, setFiles] = useState([])

  const handleFileDrop = useCallback(
    (item) => {
      if (item) {
        const files = item.files
        setFiles(files)
      }
    },
    [setFiles]
  )
  const handleFileAdd = useCallback((event) => {
    if (event.target.files) {
    }
    setFiles(event.target.files)
  }, [])

  useEffect(() => {
    const handle = async () => {
      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
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
          console.log(file)
          saveAs(blob, file.name.replace(".pdf", "_dop.pdf"))
          setSuccess(true)
          setFiles([])
        }
      }
    }
    handle()
  }, [files])
  const config = {
    angle: "25",
    spread: "360",
    startVelocity: "58",
    elementCount: "200",
    dragFriction: "0.13",
    duration: "10000",
    stagger: "3",
    width: "11px",
    height: "11px",
    perspective: "303px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
  }

  return (
    <>
      <GlobalStyle />
      <DndProvider backend={HTML5Backend}>
        <Container>
          <TargetBox onDrop={handleFileDrop} onChange={handleFileAdd} />
          <Confetti active={success} config={config} />
        </Container>
      </DndProvider>
    </>
  )
}

export default App
