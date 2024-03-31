use dioxus::html::body;
use wasm_bindgen::prelude::*;
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use serde_wasm_bindgen::from_value;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Response {
    url: String,
    data: String,
    response_type: String,
}

macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into())
    }
}

#[wasm_bindgen]
pub fn hello() {
    log!("Hello, from Rust!");
}

#[wasm_bindgen]
pub fn log(message: &str) {
    log!("{message}");
}

#[wasm_bindgen]
pub fn process_response(obj: JsValue) {
    match from_value(obj) {
        Ok(Response { url, data, response_type }) => {
            log!("response_type: {response_type}");
            log!("url: {url}");
            log!("data: {data}");
        }
        Err(err) => log!("{err}"),
    }
}
