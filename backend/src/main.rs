use axum::{
    routing::{get, post, put, delete}, // Fixed: Added put and delete imports
    Router,
    http::Method,
};
use tower_http::cors::{CorsLayer, Any};
use std::sync::Arc;
use anyhow::Result;

mod config;
mod database;
mod handlers;
mod models;
mod utils;

use config::Config;
use database::create_pool;
use handlers::{auth, products};
use models::AppState;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Load environment variables
    dotenv::dotenv().ok();

    // Load configuration
    let config = Config::from_env()?;

    // Create database pool
    let pool = create_pool(&config.database_url).await?;

    // Create app state
    let app_state = Arc::new(AppState {
        db: pool,
        config,
    });

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any);

    // Build our application with routes
    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        .nest("/auth", auth_routes())
        .nest("/products", product_routes())
        .layer(cors)
        .with_state(app_state.clone());

    // Run the server
    let bind_address = format!("{}:{}", app_state.config.host, app_state.config.port);
    let listener = tokio::net::TcpListener::bind(&bind_address).await?;
    println!("Server running on http://{}", bind_address);
    axum::serve(listener, app).await?;
    Ok(()) // This was already correct
}

fn auth_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/login", post(auth::login))
        .route("/register", post(auth::register))
}

fn product_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(products::list_products).post(products::create_product))
        .route("/:id", get(products::get_product_by_id)
            .put(products::update_product)
            .delete(products::delete_product))
}