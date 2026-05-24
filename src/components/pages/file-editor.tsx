import "@milkdown/crepe/theme/common/style.css"
import "@milkdown/crepe/theme/frame.css"
import { useParams } from "react-router"
import Editor from "../spec/file-editor/editor"

const FileEditorPage = () => {
    const { filename } = useParams()

    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="h-4/5 w-3/5 rounded-3xl bg-accent p-8">
                {filename && <Editor filename={filename} />}
            </div>
        </div>
    )
}

export default FileEditorPage
