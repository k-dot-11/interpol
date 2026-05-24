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
import { Milkdown, useEditor, useInstance } from "@milkdown/react"
import { getMarkdown } from "@milkdown/utils"
import { useEffect, useState } from "react"
import { $shortcut } from "@milkdown/utils"

const EditorWithControls = ({ filename }: { filename: string }) => {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [fileContents, setFileContents] = useState<string>("")

    // 1. Setup the save filesystem mutation
    const saveFileMutation = useSaveFile()

    // 2. Setup Milkdown instance control to query the canvas via the save button
    const [editorLoading, getInstance] = useInstance()

    // 3. Define the keymap shortcut to handle "Mod-s" directly inside the engine
    const customKeymap = $shortcut((ctx) => ({
        "Mod-s": () => {
            const content = getMarkdown()(ctx)
            saveFileMutation.mutate({ filename, content })
            return true // Prevent default browser save event
        },
    }))

    // 4. Initialize and control the Milkdown canvas instance life-cycle
    useEditor(
        (root) => {
            if (!fileContents && isLoading) return // Don't build if data hasn't arrived

            return Editor.make()
                .config((ctx) => {
                    ctx.set(rootCtx, root)
                    ctx.set(defaultValueCtx, fileContents)
                    ctx.set(editorViewOptionsCtx, {})
                    ctx.set(headingAttr.key, (node) => {
                        return {
                            class: `milkdown-heading h${node.attrs.level}`,
                        }
                    })
                })
                .use(commonmark)
                .use(customKeymap)
        },
        [fileContents, isLoading] // Re-initializes smoothly when file updates
    )

    // 5. Fetch initial file contents via Tauri IPC bridge
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

    // 6. Handle click trigger interaction on the visual UI button
    const handleSaveButtonClick = () => {
        if (editorLoading) return
        const editor = getInstance()
        if (!editor) return

        const content = editor.action(getMarkdown())
        saveFileMutation.mutate({ filename, content })
    }

    return (
        <div className="min-h-full p-6">
            <div className="flex justify-between pb-6">
                <p className="text-3xl">{filename}</p>

                <Button
                    disabled={
                        editorLoading || saveFileMutation.isPending || isLoading
                    }
                    onClick={handleSaveButtonClick}
                >
                    {editorLoading || saveFileMutation.isPending
                        ? "Saving..."
                        : "Save"}
                </Button>
            </div>

            {isLoading && (
                <div className="mb-4 animate-pulse">
                    Loading file contents...
                </div>
            )}
            {error && <div className="mb-4 text-red-500">Error: {error}</div>}

            {!isLoading && !error && <Milkdown />}
        </div>
    )
}

export default EditorWithControls
