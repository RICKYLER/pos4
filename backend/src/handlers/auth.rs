use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
};
use serde_json::Value;
use std::sync::Arc;
use validator::Validate;
use chrono::Utc;
use uuid::Uuid;

use crate::models::{
    CreateUserRequest, LoginRequest, UserResponse, AppState, User, UserRow
};
use crate::utils::{
    jwt::create_jwt,
    password::{hash_password, verify_password}
};

pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<Value>, StatusCode> {
    if let Err(_) = payload.validate() {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Find user by email using UserRow
    let user_row = sqlx::query_as!(UserRow, "SELECT * FROM users WHERE email = ?", payload.email)
        .fetch_optional(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::UNAUTHORIZED)?;
    
    // Convert to User
    let user = User::from(user_row);

    // Verify password
    if !verify_password(&payload.password, &user.password_hash)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)? {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // Create JWT token with secret from config
    let token = create_jwt(&user.id, &user.role, &state.config.jwt_secret)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(serde_json::json!({
        "token": token,
        "user": UserResponse::from(user)
    })))
}

pub async fn register(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<Json<Value>, StatusCode> {
    if let Err(_) = payload.validate() {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Check if user already exists
    let existing_user = sqlx::query!("SELECT id FROM users WHERE email = ?", payload.email)
        .fetch_optional(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if existing_user.is_some() {
        return Err(StatusCode::CONFLICT);
    }

    // Hash password
    let password_hash = hash_password(&payload.password)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Generate user ID
    let user_id = Uuid::new_v4().to_string();
    let now = Utc::now();

    // Insert user
    sqlx::query!(
        "INSERT INTO users (id, email, name, password_hash, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        user_id,
        payload.email,
        payload.name,
        password_hash,
        payload.role.to_string(),
        true,
        now,
        now
    )
    .execute(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Fetch the created user
    let user_row = sqlx::query_as!(UserRow, "SELECT * FROM users WHERE id = ?", user_id)
        .fetch_one(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let user = User::from(user_row);

    Ok(Json(serde_json::json!({
        "message": "User created successfully",
        "user": UserResponse::from(user)
    })))
}