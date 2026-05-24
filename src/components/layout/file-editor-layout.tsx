import { Outlet } from "react-router"
import { Separator } from "../ui/separator"

const FileEditorLayout = () => {
    return (
        <>
            <div className="fixed top-0 bottom-0 left-0 w-1/4 bg-accent p-4">
                <h1 className="text-4xl">Interpol</h1>
                <Separator className="my-4" />
            </div>
            <div className="flex min-h-full w-full gap-4 p-8">
                <div className="w-1/4" />
                <Outlet />
            </div>
        </>
    )
}

export default FileEditorLayout
