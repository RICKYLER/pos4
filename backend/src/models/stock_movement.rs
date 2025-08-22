use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct StockMovement {
    pub id: Uuid,
    pub product_id: Uuid,
    pub movement_type: MovementType,
    pub quantity: i32,
    pub reason: String,
    pub user_id: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "movement_type", rename_all = "lowercase")]
pub enum MovementType {
    In,
    Out,
    Adjustment,
}

#[derive(Debug, Deserialize, Validate)]
#[allow(dead_code)] // Suppress warnings for future development
pub struct CreateStockMovementRequest {
    pub product_id: Uuid,
    pub movement_type: MovementType,
    pub quantity: i32,
    #[validate(length(min = 1, max = 255))]
    pub reason: String,
}