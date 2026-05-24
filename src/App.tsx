import { DebugPanel } from "./components/debug-panel"
import FileEditorPage from "./components/pages/file-editor"
import GettingStartedPage from "./components/pages/getting-started"
import { BrowserRouter, Routes, Route } from "react-router"

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<GettingStartedPage />} />
                <Route path="/file-editor">
                    <Route path=":filename" element={<FileEditorPage />} />
                </Route>
            </Routes>
            <DebugPanel />
        </BrowserRouter>
    )
}

export default App
