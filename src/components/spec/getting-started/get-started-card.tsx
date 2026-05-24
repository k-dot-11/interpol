import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { trackedInvoke } from "@/lib/tauri"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router"

const GetStartedCard = () => {
    const navigate = useNavigate()
    const [filenames, setFilenames] = useState<string[]>()

    useEffect(() => {
        // Declare it internally so the effect encapsulates the entire lifecycle
        const fetchAndSetFiles = async () => {
            try {
                const result = await trackedInvoke<string[]>("list_notes")
                setFilenames(result)
            } catch (e) {
                console.error(e)
            }
        }
        fetchAndSetFiles()
    }, [])

    const navigateToFileEditor = (filename: string) => {
        navigate(`/file-editor/${filename}`)
    }

    return (
        <Card className="w-1/4">
            <CardHeader>
                <CardTitle className="text-2xl">Get Started</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-lg">Your files</p>
                <Separator className="my-4" />
                {filenames?.map((item) => {
                    return (
                        <div
                            key={item}
                            className="flex items-center justify-between"
                        >
                            <p>{item}</p>
                            <Button
                                variant="link"
                                className="cursor-pointer"
                                onClick={() => navigateToFileEditor(item)}
                            >
                                Open
                            </Button>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}

export default GetStartedCard
