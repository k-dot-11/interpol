import { invoke } from "@tauri-apps/api/core" // If using Tauri v2
import { useEffect, useRef, useState } from "react"
import { Crepe } from "@milkdown/crepe"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { trackedInvoke } from "@/lib/tauri"

const Editor = ({ filename }: { filename: string }) => {
    const editorRef = useRef<HTMLDivElement>(null)
    const crepeRef = useRef<Crepe | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const handleSaveFile = async () => {
        // 1. Ensure the editor has been fully loaded and instantiated
        if (!crepeRef.current) return

        // 2. Fetch the raw markdown content directly from Crepe
        const currentMarkdown = crepeRef.current.getMarkdown()
        try {
            // 3. Send it to your Rust backend command
            await trackedInvoke<string>("save_note", {
                filename: filename,
                content: currentMarkdown,
            })
            console.log("File saved successfully!")
        } catch (err) {
            console.error("Failed to save file:", err)
        }
    }

    useEffect(() => {
        // Enforce that we have a filename before attempting to load
        if (!filename) return

        const loadAndInitialize = async () => {
            try {
                setIsLoading(true)

                // 1. Call the Rust command 'load_file_contents'
                // Pass the backend arguments inside an object payload
                const fileContents = await invoke<string>(
                    "load_file_contents",
                    {
                        filename: filename,
                    }
                )

                // Check if the backend safely reported the file is missing
                if (fileContents === "File does not exist") {
                    setError("The requested file could not be found.")
                    return
                }

                // 2. Initialize the Crepe editor if the DOM node exists
                if (editorRef.current && !crepeRef.current) {
                    const crepe = new Crepe({
                        root: editorRef.current,
                        defaultValue: fileContents, // Pass fetched content down here
                    })

                    await crepe.create()
                    crepeRef.current = crepe // Keep a reference to prevent re-initialization
                }
            } catch (err) {
                // If the Rust Result returns an Err(String), it catches here automatically
                console.error("Backend error:", err)
                setError(err as string)
            } finally {
                setIsLoading(false)
            }
        }

        loadAndInitialize()

        // Cleanup: destroy the editor if the component unmounts
        return () => {
            if (crepeRef.current) {
                crepeRef.current.destroy()
                crepeRef.current = null
            }
        }
    }, [filename]) // Re-run if the filename path parameter changes

    return (
        <div className="p-6">
            <div className="flex justify-between pb-6">
                <p className="text-3xl">{filename}</p>
                <Button variant={"outline"} onClick={() => handleSaveFile()}>
                    Save
                </Button>
            </div>
            <Separator />
            {/* Status headers live peacefully alongside the container */}
            {isLoading && (
                <div className="mb-4 animate-pulse text-muted-foreground">
                    Loading file contents...
                </div>
            )}
            {error && <div className="mb-4 text-red-500">Error: {error}</div>}

            <div
                ref={editorRef}
                className={`rounded-md border p-4 ${isLoading ? "hidden" : "block"}`}
            />
        </div>
    )
}

export default Editor
