import { trackedInvoke } from "@/lib/tauri"
import { useMutation, useQuery } from "@tanstack/react-query"

export const fetchFiles = async () => {
    const result = await trackedInvoke<string[]>("list_notes")
    return result
}

export const saveFile = async (filename: string, content: string) => {
    await trackedInvoke<string>("save_note", {
        filename: filename,
        content: content,
    })
}

export const useSaveFile = () => {
    return useMutation({
        mutationFn: ({
            filename,
            content,
        }: {
            filename: string
            content: string
        }) => saveFile(filename, content),
        mutationKey: ["saveFile"],
    })
}

export const useFetchFiles = () => {
    return useQuery({
        queryKey: ["fetchFiles"],
        queryFn: fetchFiles,
    })
}
