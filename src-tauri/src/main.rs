// src-tauri/src/main.rs

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Mutex;

struct AppState {
    logged_in: Mutex<bool>,
    username: Mutex<Option<String>>,
}

#[derive(Serialize, Deserialize)]
struct FetchRequest {
    url: String,
    method: String,
    headers: Option<serde_json::Value>,
    body: Option<String>,
}

#[derive(Serialize)]
struct FetchResponse {
    status: u16,
    headers: Vec<(String, String)>,
    body: String,
}

#[tauri::command]
async fn login(username: String, password: String, state: State<'_, AppState>) -> Result<(), String> {
    let correct_username = "admin";
    let correct_password = "admin";

    println!("Attempting login with username: {}", username);

    if username == correct_username && password == correct_password {
        let mut logged_in = state.logged_in.lock().unwrap();
        let mut logged_in_username = state.username.lock().unwrap();
        *logged_in = true;
        *logged_in_username = Some(username);
        println!("Login successful");
        Ok(())
    } else {
        println!("Login failed");
        Err("Incorrect username or password".into())
    }
}

#[tauri::command]
async fn logout(state: State<'_, AppState>) -> Result<(), String> {
    let mut logged_in = state.logged_in.lock().unwrap();
    let mut logged_in_username = state.username.lock().unwrap();
    *logged_in = false;
    *logged_in_username = None;
    println!("Logged out");
    Ok(())
}

#[tauri::command]
async fn check_login(state: State<'_, AppState>) -> Result<Option<String>, String> {
    let logged_in = state.logged_in.lock().unwrap();
    let logged_in_username = state.username.lock().unwrap();
    if *logged_in {
        println!("User is logged in as: {:?}", logged_in_username);
        Ok(logged_in_username.clone())
    } else {
        println!("No user is logged in");
        Ok(None)
    }
}

#[tauri::command]
async fn perform_fetch(request: FetchRequest) -> Result<FetchResponse, String> {
    let client = reqwest::Client::new();

    println!("Received fetch request:");
    println!("URL: {}", request.url);
    println!("Method: {}", request.method);
    println!("Headers: {:?}", request.headers);
    println!("Body: {:?}", request.body);

    let mut headers = HeaderMap::new();
    if let Some(header_map) = request.headers {
        if let serde_json::Value::Object(map) = header_map {
            for (key, value) in map {
                if let Some(value_str) = value.as_str() {
                    headers.insert(
                        HeaderName::from_bytes(key.as_bytes()).map_err(|e| e.to_string())?,
                        HeaderValue::from_str(value_str).map_err(|e| e.to_string())?,
                    );
                }
            }
        }
    }

    let response = match request.method.as_str() {
        "POST" => {
            client
                .post(&request.url)
                .headers(headers)
                .body(request.body.unwrap_or_default())
                .send()
                .await
                .map_err(|e| e.to_string())?
        }
        "PUT" => {
            client
                .put(&request.url)
                .headers(headers)
                .body(request.body.unwrap_or_default())
                .send()
                .await
                .map_err(|e| e.to_string())?
        }
        "DELETE" => {
            client
                .delete(&request.url)
                .headers(headers)
                .body(request.body.unwrap_or_default())
                .send()
                .await
                .map_err(|e| e.to_string())?
        }
        _ => {
            client
                .get(&request.url)
                .headers(headers)
                .send()
                .await
                .map_err(|e| e.to_string())?
        }
    };

    let status = response.status().as_u16();
    let headers: Vec<(String, String)> = response.headers().iter()
        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
        .collect();
    let body = response.text().await.map_err(|e| e.to_string())?;

    println!("Response status: {}", status);
    println!("Response headers: {:?}", headers);
    println!("Response body: {}", body);

    Ok(FetchResponse {
        status,
        headers,
        body,
    })
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            logged_in: Mutex::new(false),
            username: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![login, logout, check_login, perform_fetch])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
