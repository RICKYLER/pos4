use axum::{extract::{Path, State}, http::StatusCode, Json};
use serde_json::Value;
use uuid::Uuid;
use std::sync::Arc;
use validator::Validate;

use crate::models::{AppState, product::{CreateProductRequest, UpdateProductRequest, Product}};

// Handler for creating a new product
pub async fn create_product(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateProductRequest>,
) -> (StatusCode, Json<Value>) {
    // Validate the request payload
    if let Err(validation_errors) = payload.validate() {
        return (StatusCode::BAD_REQUEST, Json(
            serde_json::json!({
                "error": "Validation failed",
                "details": validation_errors.to_string()
            })
        ));
    }

    let product_id = Uuid::new_v4();
    let now = chrono::Utc::now();
    
    // Insert product into database
    let query_result = sqlx::query!(
        r#"
        INSERT INTO products (id, name, description, price, cost, sku, barcode, category, stock, min_stock, image_url, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?, ?)
        "#,
        product_id.to_string(),
        payload.name,
        payload.description,
        payload.price,
        payload.cost,
        payload.sku,
        payload.barcode,
        payload.category,
        payload.stock,
        payload.min_stock,
        payload.image_url,
        now,
        now
    )
    .execute(&state.db)
    .await;

    match query_result {
        Ok(_) => (StatusCode::CREATED, Json(
            serde_json::json!({
                "message": "Product created successfully",
                "id": product_id.to_string()
            })
        )),
        Err(e) => {
            eprintln!("Database error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(
                serde_json::json!({
                    "error": "Failed to create product"
                })
            ))
        }
    }
}

// Handler for getting all products
pub async fn list_products(
    State(state): State<Arc<AppState>>,
) -> (StatusCode, Json<Value>) {
    let query_result = sqlx::query_as!(
        Product,
        "SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC"
    )
    .fetch_all(&state.db)
    .await;

    match query_result {
        Ok(products) => (StatusCode::OK, Json(
            serde_json::json!({
                "products": products,
                "count": products.len(),
                "message": "Products retrieved successfully"
            })
        )),
        Err(e) => {
            eprintln!("Database error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(
                serde_json::json!({
                    "error": "Failed to retrieve products"
                })
            ))
        }
    }
}

// Handler for getting product details by ID
pub async fn get_product_by_id(
    Path(id): Path<String>,
    State(state): State<Arc<AppState>>,
) -> (StatusCode, Json<Value>) {
    let query_result = sqlx::query_as!(
        Product,
        "SELECT * FROM products WHERE id = ? AND is_active = true",
        id
    )
    .fetch_optional(&state.db)
    .await;

    match query_result {
        Ok(Some(product)) => (StatusCode::OK, Json(
            serde_json::json!({
                "product": product,
                "message": "Product retrieved successfully"
            })
        )),
        Ok(None) => (StatusCode::NOT_FOUND, Json(
            serde_json::json!({
                "error": "Product not found"
            })
        )),
        Err(e) => {
            eprintln!("Database error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(
                serde_json::json!({
                    "error": "Failed to retrieve product"
                })
            ))
        }
    }
}

// Handler for updating an existing product
pub async fn update_product(
    Path(id): Path<String>,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<UpdateProductRequest>,
) -> (StatusCode, Json<Value>) {
    let now = chrono::Utc::now();
    
    // Build dynamic update query based on provided fields
    let mut query_parts = Vec::new();
    let mut params: Vec<String> = Vec::new();
    
    if let Some(name) = &payload.name {
        query_parts.push("name = ?");
        params.push(name.clone());
    }
    if let Some(description) = &payload.description {
        query_parts.push("description = ?");
        params.push(description.clone());
    }
    if let Some(price) = payload.price {
        query_parts.push("price = ?");
        params.push(price.to_string());
    }
    // Add other fields as needed...
    
    if query_parts.is_empty() {
        return (StatusCode::BAD_REQUEST, Json(
            serde_json::json!({
                "error": "No fields provided for update"
            })
        ));
    }
    
    query_parts.push("updated_at = ?");
    params.push(now.to_rfc3339());
    params.push(id.clone());
    
    let query = format!("UPDATE products SET {} WHERE id = ? AND is_active = true", query_parts.join(", "));
    
    // For simplicity, using a basic update. In production, use proper parameter binding
    let query_result = sqlx::query(&query)
        .execute(&state.db)
        .await;

    match query_result {
        Ok(result) => {
            if result.rows_affected() > 0 {
                (StatusCode::OK, Json(
                    serde_json::json!({
                        "message": "Product updated successfully",
                        "id": id
                    })
                ))
            } else {
                (StatusCode::NOT_FOUND, Json(
                    serde_json::json!({
                        "error": "Product not found"
                    })
                ))
            }
        },
        Err(e) => {
            eprintln!("Database error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(
                serde_json::json!({
                    "error": "Failed to update product"
                })
            ))
        }
    }
}

// Handler for deleting a product by ID (soft delete)
pub async fn delete_product(
    Path(id): Path<String>,
    State(state): State<Arc<AppState>>,
) -> (StatusCode, Json<Value>) {
    let now = chrono::Utc::now();
    
    let query_result = sqlx::query!(
        "UPDATE products SET is_active = false, updated_at = ? WHERE id = ? AND is_active = true",
        now,
        id
    )
    .execute(&state.db)
    .await;

    match query_result {
        Ok(result) => {
            if result.rows_affected() > 0 {
                (StatusCode::OK, Json(
                    serde_json::json!({
                        "message": "Product deleted successfully",
                        "id": id
                    })
                ))
            } else {
                (StatusCode::NOT_FOUND, Json(
                    serde_json::json!({
                        "error": "Product not found"
                    })
                ))
            }
        },
        Err(e) => {
            eprintln!("Database error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(
                serde_json::json!({
                    "error": "Failed to delete product"
                })
            ))
        }
    }
}