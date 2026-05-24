import { DebugPanel } from "./components/debug-panel"
import FileEditorPage from "./components/pages/file-editor"
import GettingStartedPage from "./components/pages/getting-started"
import { BrowserRouter, Routes, Route } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

function App() {
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route index element={<GettingStartedPage />} />
                    <Route path="/file-editor">
                        <Route path=":filename" element={<FileEditorPage />} />
                    </Route>
                </Routes>
                <DebugPanel />
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App
