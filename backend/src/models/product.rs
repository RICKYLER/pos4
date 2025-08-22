use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Product {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub price: f64,
    pub cost: f64,
    pub sku: String,
    pub barcode: Option<String>,
    pub category: String,
    pub stock: i32,
    pub min_stock: i32,
    pub image_url: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
#[allow(dead_code)] // Suppress warnings for future development
pub struct CreateProductRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    pub description: Option<String>,
    #[validate(range(min = 0.0))]
    pub price: f64,
    #[validate(range(min = 0.0))]
    pub cost: f64,
    #[validate(length(min = 1, max = 100))]
    pub sku: String,
    pub barcode: Option<String>,
    #[validate(length(min = 1, max = 100))]
    pub category: String,
    #[validate(range(min = 0))]
    pub stock: i32,
    #[validate(range(min = 0))]
    pub min_stock: i32,
    pub image_url: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
#[allow(dead_code)] // Suppress warnings for future development
pub struct UpdateProductRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub price: Option<f64>,
    pub cost: Option<f64>,
    pub sku: Option<String>,
    pub barcode: Option<String>,
    pub category: Option<String>,
    pub stock: Option<i32>,
    pub min_stock: Option<i32>,
    pub image_url: Option<String>,
    pub is_active: Option<bool>,
}