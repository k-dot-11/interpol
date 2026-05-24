import "@milkdown/crepe/theme/common/style.css"
import "@milkdown/crepe/theme/frame.css"
import { useParams } from "react-router"
import EditorWithControls from "../spec/file-editor/md-editor"
import { MilkdownProvider } from "@milkdown/react"

const FileEditorPage = () => {
    const { filename } = useParams()

    return (
        <div className="w-3/4 rounded-3xl bg-accent p-8">
            <MilkdownProvider>
                {filename && <EditorWithControls filename={filename} />}
            </MilkdownProvider>
        </div>
    )
}

export default FileEditorPage
