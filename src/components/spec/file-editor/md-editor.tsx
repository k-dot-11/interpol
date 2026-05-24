import { Button } from "@/components/ui/button"
import { trackedInvoke } from "@/lib/tauri"
import { useSaveFile } from "@/service/file-management-service"
import {
    defaultValueCtx,
    Editor,
    editorViewOptionsCtx,
    rootCtx,
} from "@milkdown/kit/core"
import { commonmark, headingAttr } from "@milkdown/kit/preset/commonmark"
import {
    Milkdown,
    MilkdownProvider,
    useEditor,
    useInstance,
} from "@milkdown/react"
import { getMarkdown } from "@milkdown/utils"
import { useEffect, useState } from "react"

const EditorWithControls = ({ filename }: { filename: string }) => {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [fileContents, setFileContents] = useState<string>("")

    useEffect(() => {
        if (!filename) return

        const loadAndInitialize = async () => {
            try {
                setIsLoading(true)
                const res = await trackedInvoke<string>("load_file_contents", {
                    filename: filename,
                })

                if (res === "File does not exist") {
                    setError("The requested file could not be found.")
                    return
                }

                setFileContents(res)
            } catch (err) {
                console.error("Backend error:", err)
                setError(err as string)
            } finally {
                setIsLoading(false)
            }
        }

        loadAndInitialize()
    }, [filename])

    return (
        // ✅ Single, master provider for this layout module
        <MilkdownProvider>
            <div className="p-6">
                <div className="flex justify-between pb-6">
                    <p className="text-3xl">{filename}</p>
                    {/* Controls sit side-by-side with editor elements */}
                    <EditorControls filename={filename} />
                </div>

                {isLoading && (
                    <div className="mb-4 animate-pulse">
                        Loading file contents...
                    </div>
                )}
                {error && (
                    <div className="mb-4 text-red-500">Error: {error}</div>
                )}

                {/* ✅ Render the editor element under the same provider layout */}
                {!isLoading && !error && (
                    <MilkdownEditor defaultValue={fileContents} />
                )}
            </div>
        </MilkdownProvider>
    )
}

const EditorControls = ({ filename }: { filename: string }) => {
    // ✅ This will now correctly transition to false once the master provider hooks the instances
    const [editorLoading, getInstance] = useInstance()
    const saveFileMutation = useSaveFile()

    const handleSave = async () => {
        if (editorLoading) return

        const editor = getInstance()
        if (!editor) return

        // Action fetches markdown tree string natively
        const content = editor.action(getMarkdown())

        saveFileMutation.mutate({ filename: filename, content: content })
    }

    return (
        <Button disabled={editorLoading} onClick={handleSave}>
            {editorLoading ? "Loading..." : "Save"}
        </Button>
    )
}

// Keep the core canvas simple and pass down data directly
const MilkdownEditor = ({ defaultValue }: { defaultValue: string }) => {
    useEditor(
        (root) => {
            return (
                Editor.make()
                    .config((ctx) => {
                        ctx.set(rootCtx, root)
                        ctx.set(defaultValueCtx, defaultValue)
                        ctx.set(editorViewOptionsCtx, {})
                        ctx.set(headingAttr.key, (node) => {
                            return {
                                class: `milkdown-heading h${node.attrs.level}`,
                            }
                        })
                    })
                    // .config(nord)
                    .use(commonmark)
            )
        },
        [defaultValue]
    ) // Added dependency to allow re-initialization if file changes

    return <Milkdown />
}

export default EditorWithControls
