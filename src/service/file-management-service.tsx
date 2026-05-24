import { trackedInvoke } from "@/lib/tauri"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

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

export const deleteFile = async (filename: string) => {
    await trackedInvoke<string>("delete_file", {
        filename: filename,
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
        onSuccess: () => {
            toast.success("File has been saved", { position: "top-center" })
        },
    })
}

export const useFetchFiles = () => {
    return useQuery({
        queryKey: ["fetchFiles"],
        queryFn: fetchFiles,
    })
}

export const useDeleteFileMutation = () => {
    return useMutation({
        mutationFn: ({ filename }: { filename: string }) =>
            deleteFile(filename),
        mutationKey: ["deleteFile"],
    })
}
