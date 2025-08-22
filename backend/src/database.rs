use sqlx::{MySqlPool, Pool, MySql};
use anyhow::Result;

pub type DbPool = Pool<MySql>;

pub async fn create_pool(database_url: &str) -> Result<DbPool> {
    let pool = MySqlPool::connect(database_url).await?;
    Ok(pool)
}

// Commented out unused migration function to eliminate warnings
// pub async fn run_migrations(pool: &DbPool) -> Result<()> {
//     sqlx::migrate!("./migrations").run(pool).await?;
//     Ok(())
// }