import {
    useDeleteFileMutation,
    useFetchFiles,
    useSaveFile,
} from "@/service/file-management-service"
import { Plus, Trash } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog"
import { Field, FieldGroup } from "../ui/field"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"
import { Link } from "react-router"

const GettingStartedPage = () => {
    const { data: filenames, refetch, isFetching } = useFetchFiles()
    const [newFilename, setNewFilename] = useState<string>("interpol document")
    const saveFileMutation = useSaveFile()
    const deleteFileMutation = useDeleteFileMutation()

    const handleCreateNewFile = async () => {
        await saveFileMutation.mutateAsync({
            content: "",
            filename: `${newFilename}.md`,
        })
        refetch()
    }

    const deleteFile = async (filename: string) => {
        await deleteFileMutation.mutateAsync({
            filename: filename,
        })
        refetch()
    }
    return (
        <div className="flex min-h-svh items-center justify-center p-6">
            <Card className="w-1/2">
                <CardHeader className="flex justify-between">
                    <CardTitle className="text-2xl">Get Started</CardTitle>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus /> New
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a new file</DialogTitle>
                                <DialogDescription>
                                    The file will be created under the Interpol
                                    folders of your documents directory
                                </DialogDescription>
                            </DialogHeader>
                            <FieldGroup>
                                <Field>
                                    <Label htmlFor="name-1">Name</Label>
                                    <Input
                                        id="name-1"
                                        name="name"
                                        value={newFilename}
                                        onChange={(e) => {
                                            setNewFilename(e.target.value)
                                        }}
                                    />
                                </Field>
                            </FieldGroup>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button onClick={handleCreateNewFile}>
                                        Create
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">Your files</p>
                    <Separator className="my-4" />
                    {isFetching && !filenames && <p>Loading...</p>}
                    {filenames?.length === 0 && (
                        <p className="text-center text-gray-400">
                            No files found
                        </p>
                    )}
                    {filenames?.map((item) => {
                        return (
                            <div
                                key={item}
                                className="flex items-center justify-between"
                            >
                                <Link to={`/file-editor/${item}`}>
                                    <p className="hover:underline">{item}</p>
                                </Link>
                                <Button
                                    variant="ghost"
                                    className="cursor-pointer text-destructive"
                                    size="icon-sm"
                                    onClick={() => deleteFile(item)}
                                >
                                    <Trash />
                                </Button>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}

export default GettingStartedPage
