// use validator::Validate;
// use axum::{
//     http::StatusCode,
//     response::Json,
// };
// use serde_json::{json, Value};

// pub fn validate_payload<T: Validate>(payload: &T) -> Result<(), (StatusCode, Json<Value>)> {
//     if let Err(errors) = payload.validate() {
//         let error_messages: Vec<String> = errors
//             .field_errors()
//             .iter()
//             .map(|(field, errors)| {
//                 format!("{}: {}", field, errors[0].message.as_ref().unwrap_or(&"Invalid value".into()))
//             })
//             .collect();
//         
//         return Err((
//             StatusCode::BAD_REQUEST,
//             Json(json!({
//                 "errors": error_messages
//             }))
//         ));
//     }
//     Ok(())
// }