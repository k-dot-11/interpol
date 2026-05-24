import { DebugPanel } from "./components/debug-panel"
import FileEditorPage from "./components/pages/file-editor"
import GettingStartedPage from "./components/pages/getting-started"
import { BrowserRouter, Routes, Route } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import FileEditorLayout from "./components/layout/file-editor-layout"
import { Toaster } from "@/components/ui/sonner"

function App() {
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <Toaster />
            <BrowserRouter>
                <Routes>
                    <Route index element={<GettingStartedPage />} />
                    <Route path="/file-editor" element={<FileEditorLayout />}>
                        <Route path=":filename" element={<FileEditorPage />} />
                    </Route>
                </Routes>
                <DebugPanel />
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App
