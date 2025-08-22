use anyhow::Result;
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};

use crate::models::user::UserRole;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub role: UserRole,
    pub exp: i64,
    pub iat: i64,
}

pub fn create_jwt(user_id: &str, role: &UserRole, secret: &str) -> Result<String> {
    let now = Utc::now();
    let expire = now + Duration::hours(24);

    let claims = Claims {
        sub: user_id.to_string(),
        role: role.clone(),
        exp: expire.timestamp(),
        iat: now.timestamp(),
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )?;

    Ok(token)
}

// Commented out unused function to eliminate warnings
// pub fn verify_jwt(token: &str, secret: &str) -> Result<Claims> {
//     // Implementation commented out
// }