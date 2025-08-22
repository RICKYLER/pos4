pub mod user;
pub mod product;
pub mod sale;
pub mod customer;
pub mod stock_movement;

pub use user::*;

use crate::database::DbPool;
use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub db: DbPool,
    pub config: Config,
}