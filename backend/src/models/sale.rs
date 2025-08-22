use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Sale {
    pub id: Uuid,
    pub subtotal: f64,
    pub tax: f64,
    pub discount: f64,
    pub total: f64,
    pub payment_method: PaymentMethod,
    pub cashier_id: Uuid,
    pub customer_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct SaleItem {
    pub id: Uuid,
    pub sale_id: Uuid,
    pub product_id: Uuid,
    pub product_name: String,
    pub quantity: i32,
    pub unit_price: f64,
    pub total: f64,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "payment_method", rename_all = "lowercase")]
pub enum PaymentMethod {
    Cash,
    Card,
    Digital,
}

#[derive(Debug, Deserialize, Validate)]
#[allow(dead_code)] // Suppress warnings for future development
pub struct CreateSaleRequest {
    pub items: Vec<CreateSaleItemRequest>,
    #[validate(range(min = 0.0))]
    pub subtotal: f64,
    #[validate(range(min = 0.0))]
    pub tax: f64,
    #[validate(range(min = 0.0))]
    pub discount: f64,
    #[validate(range(min = 0.0))]
    pub total: f64,
    pub payment_method: PaymentMethod,
    pub customer_id: Option<Uuid>,
}

#[derive(Debug, Deserialize, Validate)]
#[allow(dead_code)] // Suppress warnings for future development
pub struct CreateSaleItemRequest {
    pub product_id: Uuid,
    pub product_name: String,
    #[validate(range(min = 1))]
    pub quantity: i32,
    #[validate(range(min = 0.0))]
    pub unit_price: f64,
    #[validate(range(min = 0.0))]
    pub total: f64,
}