use std::fs;

use tauri::{webview::PageLoadEvent, AppHandle, Manager};
use tauri_plugin_log::{Target, TargetKind};
use tauri_plugin_opener::OpenerExt;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn save_note(app: AppHandle, filename: String, content: String) -> Result<(), String> {
    // Resolve the system's documents directory
    let docs_dir = app.path().document_dir().map_err(|err| err.to_string())?;

    // Create a dedicated folder for our app
    let app_dir = docs_dir.join("Interpol");

    // Ensure that the directory exists before trying to write to it
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir).map_err(|err| err.to_string())?;
    }

    let file_path = app_dir.join(filename);

    fs::write(file_path, content).map_err(|err| err.to_string())
}

#[tauri::command]
fn list_notes(app: AppHandle) -> Result<Vec<String>, String> {
    let docs_dir = app.path().document_dir().map_err(|err| err.to_string())?;
    let app_dir = docs_dir.join("Interpol");

    // If the directory doesn't exist yet, return an empty list
    if !app_dir.exists() {
        return Ok(Vec::new());
    }

    let entries = fs::read_dir(app_dir).map_err(|err| err.to_string())?;
    let mut file_names = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|err| err.to_string())?;
        let file_type = entry.file_type().map_err(|err| err.to_string())?;

        if file_type.is_file() {
            if let Some(name_str) = entry.file_name().to_str() {
                file_names.push(name_str.to_string());
            }
        }
    }
    Ok(file_names)
}

#[tauri::command]
fn load_file_contents(app: AppHandle, filename: String) -> Result<String, String> {
    let docs_dir = app.path().document_dir().map_err(|err| err.to_string())?;
    let file_path = docs_dir.join("Interpol").join(filename);

    if !file_path.exists() {
        return Ok("File does not exist".to_string());
    };

    let contents = fs::read_to_string(file_path).map_err(|err| err.to_string())?;
    Ok(contents)
}

fn external_navigation_plugin<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
    tauri::plugin::Builder::<R>::new("external-navigation")
        .on_navigation(|webview, url| {
            let is_internal_host = matches!(
                url.host_str(),
                Some("localhost") | Some("127.0.0.1") | Some("tauri.localhost") | Some("::1")
            );

            let is_internal = url.scheme() == "tauri" || is_internal_host;

            if is_internal {
                return true;
            }

            let is_external_link = matches!(url.scheme(), "http" | "https" | "mailto" | "tel");

            if is_external_link {
                log::info!("opening external link in system browser: {}", url);
                let _ = webview.opener().open_url(url.as_str(), None::<&str>);
                return false;
            }

            true
        })
        .build()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(external_navigation_plugin())
        .invoke_handler(tauri::generate_handler![
            greet,
            save_note,
            load_file_contents,
            list_notes
        ])
        .on_page_load(|webview, payload| {
            if webview.label() == "main" && matches!(payload.event(), PageLoadEvent::Finished) {
                log::info!("main webview finished loading");
                let _ = webview.window().show();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
