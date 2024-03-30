use wasm_bindgen::prelude::*;

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
pub fn process_response(body: &str) {
    let body = String::from(body);
    log!("{body}");
}
