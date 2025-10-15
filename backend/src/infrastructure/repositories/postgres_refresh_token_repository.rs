use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{PgPool, Row};
use std::sync::Arc;

use crate::domain::repositories::refresh_token_repository::{RefreshTokenRecord, RefreshTokenRepository};
use crate::domain::value_objects::WalletAddress;

pub struct PostgresRefreshTokenRepository {
    pool: PgPool,
}

impl PostgresRefreshTokenRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl RefreshTokenRepository for PostgresRefreshTokenRepository {
    async fn store_refresh_token(&self, record: RefreshTokenRecord) -> Result<(), Box<dyn std::error::Error>> {
        sqlx::query(
            r#"
            INSERT INTO refresh_tokens (id, wallet_address, token_hash, expires_at, created_at)
            VALUES ($1, $2, $3, $4, $5)
            "#
        )
        .bind(&record.id)
        .bind(&record.wallet_address.0)
        .bind(&record.token_hash)
        .bind(&record.expires_at)
        .bind(&record.created_at)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn get_refresh_token(&self, token_hash: &str) -> Result<Option<RefreshTokenRecord>, Box<dyn std::error::Error>> {
        let record = sqlx::query(
            r#"
            SELECT id, wallet_address, token_hash, expires_at, created_at
            FROM refresh_tokens
            WHERE token_hash = $1 AND expires_at > NOW()
            "#
        )
        .bind(token_hash)
        .fetch_optional(&self.pool)
        .await?;

        Ok(record.map(|r| RefreshTokenRecord {
            id: r.get(0),
            wallet_address: WalletAddress(r.get(1)),
            token_hash: r.get(2),
            expires_at: r.get(3),
            created_at: r.get(4),
        }))
    }

    async fn revoke_refresh_token(&self, token_hash: &str) -> Result<(), Box<dyn std::error::Error>> {
        sqlx::query(
            r#"
            DELETE FROM refresh_tokens WHERE token_hash = $1
            "#
        )
        .bind(token_hash)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn revoke_all_user_tokens(&self, wallet_address: &WalletAddress) -> Result<(), Box<dyn std::error::Error>> {
        sqlx::query(
            r#"
            DELETE FROM refresh_tokens WHERE wallet_address = $1
            "#
        )
        .bind(&wallet_address.0)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn cleanup_expired_tokens(&self) -> Result<(), Box<dyn std::error::Error>> {
        sqlx::query("SELECT cleanup_expired_refresh_tokens()")
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}