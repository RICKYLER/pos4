// use axum::{
//     extract::{Request, State},
//     http::StatusCode,
//     middleware::Next,
//     response::Response,
// };
// use jsonwebtoken::{decode, DecodingKey, Validation};
// use std::sync::Arc;

// use crate::models::{AppState, auth::Claims};
// use crate::utils::jwt::verify_jwt;

// pub async fn auth_middleware(
//     State(app_state): State<Arc<AppState>>,
//     mut request: Request,
//     next: Next,
// ) -> Result<Response, StatusCode> {
//     let token = request
//         .headers()
//         .get("Authorization")
//         .and_then(|header| header.to_str().ok())
//         .and_then(|header| header.strip_prefix("Bearer ").map(String::from));

//     let token = match token {
//         Some(token) => token,
//         None => return Err(StatusCode::UNAUTHORIZED),
//     };

//     let jwt_secret = app_state.config.jwt_secret.as_bytes();

//     let claims = match verify_jwt(&token, jwt_secret) {
//         Ok(claims) => claims,
//         Err(_) => return Err(StatusCode::UNAUTHORIZED),
//     };

//     request.extensions_mut().insert(claims);

//     Ok(next.run(request).await)
// }